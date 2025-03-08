import sqlite3
from faker import Faker

fake = Faker()

conn = sqlite3.connect('data/data.db')
cursor = conn.cursor()

def insert_fake_data_user(num_records):
    for _ in range(num_records):
        email = fake.email()
        password = fake.password()
        firstname = fake.first_name()
        lastname = fake.last_name()
        birthdate = fake.date_of_birth()
        avatarUrl = fake.image_url()
        nickname = fake.user_name()
        about = fake.text()
        is_public = fake.boolean()
        
        cursor.execute('''
		INSERT INTO users
			(email, password, firstname, lastname, birthdate, avatarUrl, nickname, about, is_public)
		VALUES
			(?, ?, ?, ?, ?, ?, ?, ?, ?) ;
        ''', (email, password, firstname, lastname, birthdate, avatarUrl, nickname, about, is_public))

    conn.commit()


def insert_fake_data_session(num_records, users_count):
    for _ in range(num_records):
        user_id = fake.random_int(min=1, max=users_count)
        session_hash = fake.sha256()
        
        cursor.execute('''
		INSERT INTO sessions (user_id, session_hash) VALUES (?, ?) ;
        ''', (user_id, session_hash))

    conn.commit()

def insert_fake_data_follower(num_records, users_count):
    for _ in range(num_records):
        nb_follower = fake.random_int(min=1, max=users_count)
        nb_following = fake.random_int(min=1, max=users_count)
        
        while nb_follower == nb_following:
            nb_following = fake.random_int(min=1, max=users_count)
        
        cursor.execute('''
            SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?
        ''', (nb_follower, nb_following))
        if cursor.fetchone() is None:
            cursor.execute('''
                INSERT INTO follows (follower_id, following_id) VALUES (?, ?);
            ''', (nb_follower, nb_following))

    conn.commit()


# choose scripts that you want to run
# insert_fake_data_user(20)
insert_fake_data_session(5,20)
# insert_fake_data_follower(200,20)

conn.close()

print("Fake data inserted successfully.")
