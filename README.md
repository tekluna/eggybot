## What is this? ##
The greatest discord bot ever made


---

## Prisma ORM  + Sqlite
Prisma is an easy to use ORM, and sqlite is a great way to make simple sql database

### How to use it ?

#### Making Models :

You can make models in the `schema.prisma` file and follow this documentation [Prisma Defining Models](https://www.prisma.io/docs/orm/prisma-schema/data-model/models#defining-models)

#### Migrations :

1. First, run this command to update your database with the already created migrations :

    ```shell  
    npx prisma migrate dev
    ```

   This command will also create the database if it doesn't exist before updating it !

    ---

2. Then if you wanna create a new migration, replace "init" by the name of your migration while running this command

    ```shell
    npx prisma migrate dev --name init
    ```
