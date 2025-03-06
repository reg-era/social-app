package core

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"social/pkg/utils"

	"golang.org/x/crypto/bcrypt"
)

type User struct {
	Id          int    `json:"id"`
	Email       string `json:"email"`
	Password    string `json:"password"`
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	DateOfBirth string `json:"dateOfBirth"`
	AvatarUrl   string `json:"avatarUrl"`
	Nickname    string `json:"nickname"`
	AboutMe     string `json:"aboutMe"`
	IsPublic    bool   `json:"isPublic"`
}

func (a *API) HandleUser(w http.ResponseWriter, r *http.Request) {
	userId, ok  := r.Context().Value("userID").(int)
	if !ok {
		switch r.Method {
		case http.MethodPost:
			err := r.ParseMultipartForm(100 << 20)
			if err != nil {
				utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{
					"error": "Status Bad Request",
				})
				return
			}
	
			var user User
	
			user.Email = r.FormValue("email")
			user.Password = r.FormValue("password")
			user.FirstName = r.FormValue("firstName")
			user.LastName = r.FormValue("lastName")
			user.DateOfBirth = r.FormValue("dateOfBirth")
			user.Nickname = r.FormValue("nickname")
			user.AboutMe = r.FormValue("aboutMe")
	
			file, handler, err := r.FormFile("avatar")
			if err == nil {
				path, err := utils.UploadFileData(file, handler)
				if err != nil {
					utils.RespondWithJSON(w, http.StatusBadRequest, map[string]string{
						"error": err.Error(),
					})
					return
				}
				user.AvatarUrl = filepath.Join("api/global/", path)
			}
	
			if status, err := a.AddUser(&user); err != nil {
				if user.AvatarUrl != "" {
					_ = os.Remove(strings.ReplaceAll(user.AvatarUrl, "api/global/", "data/global/"))
				}
				utils.RespondWithJSON(w, status, map[string]string{
					"error": err.Error(),
				})
				return
			}
	
			utils.RespondWithJSON(w, http.StatusOK, map[string]string{
				"valid": "user add succesfuly",
			})
		case http.MethodGet:
			userInfo, err := a.ReadUser(userId)
			if err != nil {
				utils.RespondWithJSON(w, http.StatusNotFound, map[string]string{
					"error": "user not found",
				})
				return
			}
	
			utils.RespondWithJSON(w, 200, userInfo)
		default:
			utils.RespondWithJSON(w, http.StatusMethodNotAllowed, map[string]string{
				"error": "Status Method Not Allowed",
			})
		}
	}

}

func (a *API) AddUser(user *User) (int, error) {
	const emailRegex = `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
	re := regexp.MustCompile(emailRegex)

	if len(user.FirstName) <= 0 ||
		len(user.LastName) <= 0 ||
		len(user.Password) <= 0 ||
		!re.MatchString(user.Email) {
		return 404, fmt.Errorf("invalid input format")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		fmt.Println(err)
		return 500, fmt.Errorf("status internal server error")
	}

	if _, err := a.Create(
		`INSERT INTO users
			(email, password, firstname, lastname, birthdate, avatarUrl, nickname, about, is_public)
		VALUES
			(?, ?, ?, ?, ?, ?, ?, ?, ?) ;`,
		user.Email, hash, user.FirstName, user.LastName, user.DateOfBirth, user.AvatarUrl, user.Nickname, user.AboutMe, user.IsPublic); err != nil {
		return 409, fmt.Errorf("faild to add user")
	}
	return 200, nil
}

func (a *API) ReadUser(id int) (User, error) {
	data := a.Read(`
	SELECT email, first_name, last_name, date_of_birth, avatar_url, nickname, about_me, is_public
	FROM users WHERE id = ? ;
	`, id)

	var user User
	if err := data.Scan(&user.Email, &user.FirstName, &user.LastName, &user.DateOfBirth, &user.AvatarUrl, &user.Nickname, &user.AboutMe, &user.IsPublic); err != nil {
		log.Printf("Scaning user: %v\n", err)
		return User{}, err
	}

	return user, nil
}
