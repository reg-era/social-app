import sqlite3
from faker import Faker

fake = Faker()

db_path = '../../data/data.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

def insert_fake_data(num_records):
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

insert_fake_data(10)

conn.close()

print("Fake data inserted successfully.")
