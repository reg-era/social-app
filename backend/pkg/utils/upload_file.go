package utils

import (
	"encoding/base64"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"

	"github.com/google/uuid"
)

func UploadFileData(file multipart.File, handler *multipart.FileHeader) (string, error) {
	if handler.Size > (5 * 1024 * 1024) {
		return "", fmt.Errorf("file size exceeds the 5MB limit")
	}

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		return "", err
	}

	fileType := http.DetectContentType(fileBytes)

	if fileType != "image/jpeg" && fileType != "image/png" && fileType != "image/gif" {
		return "", fmt.Errorf("invalid file type. Only JPEG, PNG, and GIF are allowed")
	}

	uniqueUUID := uuid.New()
	encodedUUID := base64.RawURLEncoding.EncodeToString(uniqueUUID[:])

	ext := filepath.Ext(handler.Filename)
	finalPath := filepath.Join("data/global/", encodedUUID+ext)

	dstFile, err := os.Create(finalPath)
	if err != nil {
		return "", err
	}
	defer dstFile.Close()

	_, err = dstFile.Write(fileBytes)
	if err != nil {
		return "", err
	}

	return encodedUUID + ext, nil
}
