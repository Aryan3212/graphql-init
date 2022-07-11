import express from "express";
import { graphqlHTTP } from "express-graphql";
import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLList,
} from "graphql";
const authors = [
    { id: 1, name: "J. K. Rowling" },
    { id: 2, name: "J. R. R. Tolkien" },
    { id: 3, name: "Brent Weeks" },
];

const books = [
    { id: 1, name: "Harry Potter and the Chamber of Secrets", authorId: 1 },
    { id: 2, name: "Harry Potter and the Prisoner of Azkaban", authorId: 1 },
    { id: 3, name: "Harry Potter and the Goblet of Fire", authorId: 1 },
    { id: 4, name: "The Fellowship of the Ring", authorId: 2 },
    { id: 5, name: "The Two Towers", authorId: 2 },
    { id: 6, name: "The Return of the King", authorId: 2 },
    { id: 7, name: "The Way of Shadows", authorId: 3 },
    { id: 8, name: "Beyond the Shadows", authorId: 3 },
];

const BookType = new GraphQLObjectType({
    name: "Book",
    description: "A book written by an author",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLInt) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLInt) },
        author: {
            type: AuthorType,
            resolve: (book) =>
                authors.find((author) => author.id === book.authorId),
        },
    }),
});
const AuthorType = new GraphQLObjectType({
    name: "Author",
    description: "An author who has written a book",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLInt) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) =>
                books.filter((book) => author.id === book.authorId),
        },
    }),
});

const RootQueryType = new GraphQLObjectType({
    name: "RootQuery",
    description: "Base query",
    fields: () => ({
        book: {
            type: BookType,
            args: { id: { type: GraphQLInt } },
            resolve: (root, args) => books.find((book) => book.id === args.id),
        },
        author: {
            type: AuthorType,
            args: { id: { type: GraphQLInt } },
            resolve: (root, args) =>
                authors.find((author) => author.id === args.id),
        },
        books: { type: new GraphQLList(BookType), resolve: () => books },
        authors: { type: new GraphQLList(AuthorType), resolve: () => authors },
    }),
});

const RootMutationType = new GraphQLObjectType({
    name: "RootMutation",
    description: "Base mutation",
    fields: () => ({
        addBook: {
            type: BookType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                authorId: { type: new GraphQLNonNull(GraphQLInt) },
            },
            resolve: (root, args) => {
                const book = {
                    id: books.length + 1,
                    name: args.name,
                    authorId: args.authorId,
                };
                books.push(book);
                return book;
            },
        },
        addAuthor: {
            type: AuthorType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve: (root, args) => {
                const author = {
                    id: authors.length + 1,
                    name: args.name,
                };
                authors.push(author);
                return author;
            },
        },
    }),
});

const app = express();

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType,
});
app.use(
    "/graphql",
    graphqlHTTP({
        schema: schema,
        graphiql: true,
    })
);
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
