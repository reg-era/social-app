import os
import random
import sqlite3
from faker import Faker

fake = Faker()

conn = sqlite3.connect('data/data.db')
cursor = conn.cursor()

def generate_random_image(chance=0.5):
    image_url = "" if random.random() < chance else random.choice(os.listdir('./data/global'))
    if image_url != "":
        image_url = os.path.join('/api/global', image_url)

    return image_url

def insert_fake_data_user(num_records):
    for _ in range(num_records):
        email = fake.email()
        password = fake.password()
        firstname = fake.first_name()
        lastname = fake.last_name()
        birthdate = fake.date_of_birth()
        avatarUrl = generate_random_image()
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

def insert_fake_data_group(num_records, users_count):
    for _ in range(num_records):
        user_id = fake.random_int(min=1, max=users_count)
        title = fake.last_name()
        description = fake.text()

        cursor.execute('''
		INSERT INTO groups ( title, description, creator_id ) VALUES ( ?, ?, ? );
        ''', (title,description,user_id))

    conn.commit()

def insert_fake_data_posts(num_records, users_count):
    for _ in range(num_records):
        user_id = fake.random_int(min=1, max=users_count)
        content = fake.text()
        visibility = random.choice(['public', 'followers', 'private'])
        image_url = generate_random_image(0.65)

        cursor.execute('''
            INSERT INTO posts (user_id, content, image_url, visibility) 
            VALUES (?, ?, ?, ?);
        ''', (user_id, content, image_url, visibility))

    conn.commit()

def insert_fake_data_comment(num_records, users_count, posts_count):
    for _ in range(num_records):
        post_id = fake.random_int(min=1, max=posts_count)
        user_id = fake.random_int(min=1, max=users_count)
        content = fake.text()
        image_url = generate_random_image()

        cursor.execute('''
            INSERT INTO comments (post_id, user_id, content, image_url)
            VALUES (?, ?, ?, ?)
        ''', (post_id, user_id, content, image_url))

    conn.commit()

def insert_fake_data_messages(num_records, users_count):
    for _ in range(num_records):
        sender = fake.random_int(min=1, max=users_count)
        receiver = fake.random_int(min=1, max=users_count)
        content = fake.text()
        cursor.execute('''
            INSERT INTO messages (sender_id, receiver_id, content)
            VALUES (?, ?, ?)''', (sender, receiver, content))

    conn.commit()


# choose scripts that you want to run
insert_fake_data_user(20)
insert_fake_data_session(5,20)
insert_fake_data_follower(200,20)
# insert_fake_data_group(20,20)
insert_fake_data_posts(100,20)
insert_fake_data_comment(300,20,100)
insert_fake_data_messages(300,20)

conn.close()

print("Fake data inserted successfully.")
