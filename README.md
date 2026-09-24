# movie-list

## Project setup

```
npm install
```

Create a local `.env.local` from `.env.example` and provide the Supabase URL,
Supabase anon key, and OMDb API key. Keep the Supabase service-role key only in
`.env.local` when running `movie-uploader.js`; never expose or commit it.

The live Add Movie flow requires `VUE_APP_SUPABASE_URL`,
`VUE_APP_SUPABASE_ANON_KEY`, and `VUE_APP_OMDB_API_KEY` to be configured in the
production build environment. Supabase must also allow the client role to
insert rows into the `movies` table through its Row Level Security policy.

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
