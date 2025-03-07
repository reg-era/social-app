package core

type Note struct {
	Type     string `json:"type"`     // follow_request, group_invite, group_request, event_created, post_comment
	Sender   int    `json:"sender"`   // user or group id
	Receiver int    `json:"receiver"` // userID
	Content  string `json:"content"`  // msg should be displayed
}
