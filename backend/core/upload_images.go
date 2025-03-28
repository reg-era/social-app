package core

import (
	"net/http"
	"strings"
)

func (a *API) UploadeImages(w http.ResponseWriter, r *http.Request) {
	if strings.HasSuffix(r.URL.Path, "/") {
		http.Error(w, "page not found -_-", http.StatusNotFound)
		return
	}
	fs := http.FileServer(http.Dir("data/global/"))
	http.StripPrefix("/api/global/", fs).ServeHTTP(w, r)
}
