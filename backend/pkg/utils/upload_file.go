package utils

import (
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"github.com/google/uuid"
)

func UploadFileData(r *http.Request) (string, string, error) {
	err := r.ParseMultipartForm(100 << 20)
	if err != nil {
		return "", "", err
	}

	file, handler, err := r.FormFile("avatar")
	if err != nil {
		return "", "", err
	}
	defer file.Close()

	if handler.Size > (5 * 1024 * 1024) {
		return "", "", fmt.Errorf("file size exceeds the 5MB limit")
	}

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		return "", "", err
	}

	fileType := http.DetectContentType(fileBytes)

	if fileType != "image/jpeg" && fileType != "image/png" && fileType != "image/gif" {
		return "", "", fmt.Errorf("invalid file type. Only JPEG, PNG, and GIF are allowed")
	}

	uniqueUUID := uuid.New()
	encodedUUID := base64.RawURLEncoding.EncodeToString(uniqueUUID[:])

	ext := filepath.Ext(handler.Filename)
	finalPath := filepath.Join("data/global/", encodedUUID+ext)

	dstFile, err := os.Create(finalPath)
	if err != nil {
		return "", "", err
	}
	defer dstFile.Close()

	_, err = dstFile.Write(fileBytes)
	if err != nil {
		return "", "", err
	}

	return filepath.Join("api/global/", encodedUUID+ext), finalPath, nil
}
