
Projekto pavadinimas: Elektroninė Knygų Biblioteka

---

Sprendžiamo uždavinio aprašymas:

Šiuolaikiniame pasaulyje daugelis skaitytojų renkasi elektronines knygas dėl jų patogumo ir prieinamumo. Tačiau trūksta centralizuotos platformos, kurioje vartotojai galėtų lengvai rasti, skaityti ir diskutuoti apie knygas. Šis projektas siekia sukurti elektroninę biblioteką, kurioje vartotojai galėtų dalintis savo mėgstamomis knygomis, palikti atsiliepimus ir bendrauti su kitais skaitytojais.

---

Sistemos paskirtis:

Sukurti internetinę platformą, leidžiančią vartotojams:

- Ieškoti ir peržiūrėti elektronines knygas.
- Bibliotekininkams pridėti naujas knygas ir kategorijas į biblioteką.
- Komentuoti, vertinti ir rezervuoti knygas.
- Bendrauti su kitais skaitytojais per komentarus.

---

Funkciniai reikalavimai:

1. Vartotojų registracija ir prisijungimas:

   - Vartotojai gali registruotis kaip skaitytojai arba prisijungti kaip svečiai.
   - Autentifikacija naudojant JWT su tinkama žetonų atnaujinimo strategija.

2. Knygų ir kategorijų valdymas:

   - Svečiai gali peržiūrėti knygų sąrašą ir aprašymus.
   - Bibliotekininkai gali pridėti naujas knygas ir kategorijas, redaguoti ir šalinti jas.
   - Administratoriai turi pilną prieigą prie sistemos valdymo.

3. Komentarų sistema:

   - Skaitytojai gali palikti komentarus ir vertinti knygas.
   - Hierarchinis API metodas leidžia gauti visus konkrečios knygos komentarus.

4. Knygų rezervacija:

   - Skaitytojai gali rezervuoti knygas.
   - Vartotojai gali peržiūrėti savo rezervacijų istoriją.
   - Administratoriai gali valdyti visas rezervacijas.

5. Vartotojų rolės:

   - Svečias: gali peržiūrėti knygas.
   - Skaitytojas: gali komentuoti, vertinti ir rezervuoti knygas.
   - Bibliotekininkas: gali pridėti, redaguoti ir šalinti knygas bei kategorijas.
   - Administratorius: turi pilną prieigą prie sistemos valdymo.

6. Paieška ir filtravimas:

   - Vartotojai gali ieškoti knygų pagal pavadinimą, autorių ar kategoriją.
   - Gauti filtruotą knygų sąrašą per API.

---

Pasirinktų technologijų aprašymas:

- Programavimo kalba: Python su Django REST Framework.
- Duomenų bazė: PostgreSQL.
- Autentifikacija ir autorizacija: JWT (JSON Web Tokens).
- API dokumentacija: OpenAPI (Swagger) specifikacija.
- Frontend: React.js.
- Debesų technologijos: AWS.

---

Taikomosios srities objektai:

1. Vartotojas (User):

   - Atributai: ID, vartotojo vardas, el. paštas, slaptažodis, rolė.
   - Rolės:
     - Svečias: gali peržiūrėti knygas.
     - Skaitytojas: gali komentuoti, vertinti ir rezervuoti knygas.
     - Bibliotekininkas: gali pridėti, redaguoti ir šalinti knygas bei kategorijas.
     - Administratorius: turi pilną prieigą prie sistemos valdymo.
   - API metodai:
     - Sukurti vartotoją: POST /api/users/
     - Gauti vartotoją: GET /api/users/{id}/ (vartotojas gali matyti savo informaciją)
     - Atnaujinti vartotoją: PUT /api/users/{id}/ (tik vartotojas arba administratorius)
     - Ištrinti vartotoją: DELETE /api/users/{id}/ (tik vartotojas arba administratorius)
     - Gauti vartotojų sąrašą: GET /api/users/ (tik administratoriams)

2. Kategorija (Category):

   - Atributai: ID, pavadinimas.
   - API metodai:
     - Sukurti kategoriją: POST /api/categories/ (tik bibliotekininkams ir administratoriams)
     - Gauti kategoriją: GET /api/categories/{id}/
     - Atnaujinti kategoriją: PUT /api/categories/{id}/ (tik bibliotekininkams ir administratoriams)
     - Ištrinti kategoriją: DELETE /api/categories/{id}/ (tik bibliotekininkams ir administratoriams)
     - Gauti kategorijų sąrašą: GET /api/categories/

3. Knyga (Book):

   - Atributai: ID, kategorijos ID, pavadinimas, autorius, aprašymas, pridėjimo data.
   - API metodai:
     - Sukurti knygą: POST /api/books/ (tik bibliotekininkams ir administratoriams)
     - Gauti knygą: GET /api/books/{id}/
     - Atnaujinti knygą: PUT /api/books/{id}/ (tik bibliotekininkams ir administratoriams)
     - Ištrinti knygą: DELETE /api/books/{id}/ (tik bibliotekininkams ir administratoriams)
     - Gauti knygų sąrašą: GET /api/books/

4. Rezervacija (Reservation):

   - Atributai: ID, knygos ID, vartotojo ID, rezervacijos data, statusas.
   - API metodai:
     - Sukurti rezervaciją: POST /api/reservations/ (skaitytojams ir aukštesniems)
     - Gauti rezervaciją: GET /api/reservations/{id}/ (tik rezervacijos autoriui arba administratoriams)
     - Atnaujinti rezervaciją: PUT /api/reservations/{id}/ (tik rezervacijos autoriui arba administratoriams)
     - Ištrinti rezervaciją: DELETE /api/reservations/{id}/ (tik rezervacijos autoriui arba administratoriams)
     - Gauti rezervacijų sąrašą: GET /api/reservations/ (tik administratoriams)

5. Komentaras (Comment):

   - Atributai: ID, knygos ID, vartotojo ID, tekstas, data.
   - API metodai:
     - Sukurti komentarą: POST /api/comments/ (skaitytojams ir aukštesniems)
     - Gauti komentarą: GET /api/comments/{id}/
     - Atnaujinti komentarą: PUT /api/comments/{id}/ (tik komentaro autoriui)
     - Ištrinti komentarą: DELETE /api/comments/{id}/ (tik komentaro autoriui arba administratoriams)
     - Gauti komentarų sąrašą: GET /api/comments/
     - Hierarchinis metodas: GET /api/books/{book_id}/comments/ (gauti konkrečios knygos komentarus)


OPENAPI json file

{
    "swagger": "2.0",
    "info": {
        "title": "E-biblioteka API",
        "description": "API documentation for E-biblioteka",
        "version": "v1"
    },
    "host": "127.0.0.1:8000",
    "schemes": [
        "http"
    ],
    "basePath": "/Ebiblioteka",
    "consumes": [
        "application/json"
    ],
    "produces": [
        "application/json"
    ],
    "securityDefinitions": {
        "Basic": {
            "type": "basic"
        }
    },
    "security": [
        {
            "Basic": []
        }
    ],
    "paths": {
        "/Category/": {
            "get": {
                "operationId": "Category_list",
                "description": "",
                "parameters": [],
                "responses": {
                    "200": {
                        "description": ""
                    }
                },
                "tags": [
                    "Category"
                ]
            },
            "post": {
                "operationId": "Category_create",
                "description": "",
                "parameters": [],
                "responses": {
                    "201": {
                        "description": ""
                    }
                },
                "tags": [
                    "Category"
                ]
            },
            "parameters": []
        },
        "/Category/{id}/": {
            "get": {
                "operationId": "Category_read",
                "description": "",
                "parameters": [],
                "responses": {
                    "200": {
                        "description": ""
                    }
                },
                "tags": [
                    "Category"
                ]
            },
            "put": {
                "operationId": "Category_update",
                "description": "",
                "parameters": [],
                "responses": {
                    "200": {
                        "description": ""
                    }
                },
                "tags": [
                    "Category"
                ]
            },
            "delete": {
                "operationId": "Category_delete",
                "description": "",
                "parameters": [],
                "responses": {
                    "204": {
                        "description": ""
                    }
                },
                "tags": [
                    "Category"
                ]
            },
            "parameters": [
                {
                    "name": "id",
                    "in": "path",
                    "required": true,
                    "type": "string"
                }
            ]
        },
        "/books/": {
            "get": {
                "operationId": "books_list",
                "description": "",
                "parameters": [],
                "responses": {
                    "200": {
                        "description": ""
                    }
                },
                "tags": [
                    "books"
                ]
            },
            "post": {
                "operationId": "books_create",
                "description": "",
                "parameters": [],
                "responses": {
                    "201": {
                        "description": ""
                    }
                },
                "tags": [
                    "books"
                ]
            },
            "parameters": []
        },
        "/books/{book_id}/comments/": {
            "get": {
                "operationId": "books_comments_list",
                "description": "",
                "parameters": [],
                "responses": {
                    "200": {
                        "description": ""
                    }
                },
                "tags": [
                    "books"
                ]
            },
            "post": {
                "operationId": "books_comments_create",
                "description": "",
                "parameters": [],
                "responses": {
                    "201": {
                        "description": ""
                    }
                },
                "tags": [
                    "books"
                ]
            },
            "parameters": [
                {
                    "name": "book_id",
                    "in": "path",
                    "required": true,
                    "type": "string"
                }
            ]
        },
        "/books/{id}/": {
            "get": {
                "operationId": "books_read",
                "description": "",
                "parameters": [],
                "responses": {
                    "200": {
                        "description": ""
                    }
                },
                "tags": [
                    "books"
                ]
            },
            "put": {
                "operationId": "books_update",
                "description": "",
                "parameters": [],
                "responses": {
                    "200": {
                        "description": ""
                    }
                },
                "tags": [
                    "books"
                ]
            },
            "delete": {
                "operationId": "books_delete",
                "description": "",
                "parameters": [],
                "responses": {
                    "204": {
                        "description": ""
                    }
                },
                "tags": [
                    "books"
                ]
            },
            "parameters": [
                {
                    "name": "id",
                    "in": "path",
                    "required": true,
                    "type": "string"
                }
            ]
        },
        "/comments/": {
            "get": {
                "operationId": "comments_list",
                "description": "",
                "parameters": [],
                "responses": {
                    "200": {
                        "description": ""
                    }
                },
                "tags": [
                    "comments"
                ]
            },
            "post": {
                "operationId": "comments_create",
                "description": "",
                "parameters": [],
                "responses": {
                    "201": {
                        "description": ""
                    }
                },
                "tags": [
                    "comments"
                ]
            },
            "parameters": []
        },
        "/comments/{id}/": {
            "get": {
                "operationId": "comments_read",
                "description": "",
                "parameters": [],
                "responses": {
                    "200": {
                        "description": ""
                    }
                },
                "tags": [
                    "comments"
                ]
            },
            "put": {
                "operationId": "comments_update",
                "description": "",
                "parameters": [],
                "responses": {
                    "200": {
                        "description": ""
                    }
                },
                "tags": [
                    "comments"
                ]
            },
            "delete": {
                "operationId": "comments_delete",
                "description": "",
                "parameters": [],
                "responses": {
                    "204": {
                        "description": ""
                    }
                },
                "tags": [
                    "comments"
                ]
            },
            "parameters": [
                {
                    "name": "id",
                    "in": "path",
                    "required": true,
                    "type": "string"
                }
            ]
        },
        "/reservations/": {
            "get": {
                "operationId": "reservations_list",
                "description": "",
                "parameters": [],
                "responses": {
                    "200": {
                        "description": ""
                    }
                },
                "tags": [
                    "reservations"
                ]
            },
            "post": {
                "operationId": "reservations_create",
                "description": "",
                "parameters": [],
                "responses": {
                    "201": {
                        "description": ""
                    }
                },
                "tags": [
                    "reservations"
                ]
            },
            "parameters": []
        },
        "/reservations/{id}/": {
            "get": {
                "operationId": "reservations_read",
                "description": "",
                "parameters": [],
                "responses": {
                    "200": {
                        "description": ""
                    }
                },
                "tags": [
                    "reservations"
                ]
            },
            "put": {
                "operationId": "reservations_update",
                "description": "",
                "parameters": [],
                "responses": {
                    "200": {
                        "description": ""
                    }
                },
                "tags": [
                    "reservations"
                ]
            },
            "delete": {
                "operationId": "reservations_delete",
                "description": "",
                "parameters": [],
                "responses": {
                    "204": {
                        "description": ""
                    }
                },
                "tags": [
                    "reservations"
                ]
            },
            "parameters": [
                {
                    "name": "id",
                    "in": "path",
                    "required": true,
                    "type": "string"
                }
            ]
        },
        "/users/": {
            "get": {
                "operationId": "users_list",
                "description": "",
                "parameters": [],
                "responses": {
                    "200": {
                        "description": ""
                    }
                },
                "tags": [
                    "users"
                ]
            },
            "parameters": []
        },
        "/users/register/": {
            "post": {
                "operationId": "users_register_create",
                "description": "",
                "parameters": [],
                "responses": {
                    "201": {
                        "description": ""
                    }
                },
                "tags": [
                    "users"
                ]
            },
            "parameters": []
        },
        "/users/{id}/": {
            "get": {
                "operationId": "users_read",
                "description": "",
                "parameters": [],
                "responses": {
                    "200": {
                        "description": ""
                    }
                },
                "tags": [
                    "users"
                ]
            },
            "parameters": [
                {
                    "name": "id",
                    "in": "path",
                    "required": true,
                    "type": "string"
                }
            ]
        },
        "/users/{id}/update/": {
            "put": {
                "operationId": "users_update_update",
                "description": "",
                "parameters": [],
                "responses": {
                    "200": {
                        "description": ""
                    }
                },
                "tags": [
                    "users"
                ]
            },
            "delete": {
                "operationId": "users_update_delete",
                "description": "",
                "parameters": [],
                "responses": {
                    "204": {
                        "description": ""
                    }
                },
                "tags": [
                    "users"
                ]
            },
            "parameters": [
                {
                    "name": "id",
                    "in": "path",
                    "required": true,
                    "type": "string"
                }
            ]
        }
    },
    "definitions": {}
}
