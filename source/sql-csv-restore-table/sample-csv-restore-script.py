# Importing necessary libraries
import numpy as np
import pandas as pd
import mysql.connector

# Establishing a connection to the MySQL database using the mysql.connector library
connection = mysql.connector.connect(
    host="###########",  # Replace with your database host address
    user="###########",  # Replace with your database username
    port=9999,  # Replace with your database port
    password="##########",  # Replace with your database password
    database="##########",  # Replace with the name of your database
)

# Loading data from a CSV file into a pandas DataFrame
df = pd.read_csv(
    "path/to/your.csv"
)  # Replace "path/to/your.csv" with the actual file path

# Optionally renaming columns in the DataFrame to match the database schema
df.rename(
    columns={
        "Example Date": "Example_Date",  # Example: rename 'Example Date' to 'Example_Date'
        "Example Name": "Example_Name",  # Example: rename 'Example Name' to 'Example_Name'
    },
    inplace=True,
)

# Replacing NaN values in the DataFrame with None for database compatibility
df = df.where(pd.notnull(df), None)

# Printing the first few rows of the DataFrame to verify its contents
print(df.head())

# Printing a list of DataFrame column names to verify them
column_list = df.columns.tolist()
print(column_list)

# Creating a cursor object using the connection
cursor = connection.cursor()

# Selecting a database to use (Optional if already specified in the connection details)
cursor.execute("use exampledb")  # Replace 'exampledb' with your database name

# Dropping the table if it already exists
cursor.execute("DROP TABLE IF EXISTS Example")

# Creating a new table with specified columns
cursor.execute(
    "CREATE TABLE Example (Employee_ID varchar(255), Name varchar(255), Role varchar(255), Hire_Date varchar(255), Leave_Date varchar(255))"
)

# Fetching the result of the last executed statement (not needed for CREATE/DROP)
result = cursor.fetchall()

# Inserting each row of the DataFrame into the database table
for _, row in df.iterrows():
    sql = """INSERT INTO Example (Employee_ID, Name, Role, Hire_Date, Leave_Date)
                VALUES (%s, %s, %s, %s, %s)"""
    cursor.execute(sql, tuple(row))
    connection.commit()

# Closing the database connection
connection.close()
