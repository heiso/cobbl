# Install & run
Install dependencies

`npm i`

Run server

`npm start`

Populate Local Database
```
curl --request POST \
  --url http://localhost:3000/graphql \
  --header 'content-type: application/json' \
  --data '{"query":"mutation {\n  brewery1: createBrewery(input: {\n\t\tname: \"Brouwerij Van Steenberge\",\n\t\tlocation: \"Ertvelde\"\n\t}) {\n    id\n    name\n  }\n\n\tbrewery2: createBrewery(input: {\n\t\tname: \"Chez moi\",\n\t\tlocation: \"Paris\"\n\t}) {\n    id\n    name\n  }\n}\n"}'
```
```
curl --request POST \
  --url http://localhost:3000/graphql \
  --header 'content-type: application/json' \
  --data '{"query":"mutation {\n  beer1: createBeer(input: {\n\t\tname: \"Gulden Draak\",\n\t\tbrewery: \"brouwerij_van_steenberge\"\n\t}) {\n    name\n\t\tid\n  }\n\t\n\tbeer2: createBeer(input: {\n\t\tname: \"Gulden Draak 9000 Quadruple\",\n\t\tbrewery: \"brouwerij_van_steenberge\"\n\t}) {\n    name\n\t\tid\n  }\n\t\n  beer3: createBeer(input: {\n\t\tname: \"TooBadBeer\",\n\t\tbrewery: \"chez_moi\"\n\t}) {\n    name\n\t\tid\n  }\n\n}\n"}'
```

Make a request (get beers)

```
curl --request POST \
  --url http://localhost:3000/graphql \
  --header 'content-type: application/json' \
  --data '{"query":"{\n  getBeers {\n    id\n    createdAt\n    updatedAt\n    name\n    brewery {\n      name\n      location\n    }\n  }\n}\n"}'
```

Run playground with `http://localhost:3000/graphql`
