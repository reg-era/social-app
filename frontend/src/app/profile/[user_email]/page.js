const ForeingProfile = async ({ params }) => {
    const userEmail = (await params).user_email

    return (
        <h1>profile fo user {userEmail}</h1>
    )
}

export default ForeingProfile;