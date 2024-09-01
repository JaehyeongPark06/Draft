# Draft

https://github.com/user-attachments/assets/e3973d9a-5679-4d7d-adc8-2c2ea1432584

## About

A real time collaborative document editor with audio, image, video uploads/embeds, emoji support and other rich text features.

## Libraries and Tools Used

### Frontend

- [Next.js 14 (app router)](https://nextjs.org/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Lucia auth](https://lucia-auth.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Liveblocks](https://liveblocks.io/)
- [Zod](https://zod.dev/)

### Backend

- [Supabase](https://supabase.com/)
- [UploadThing (AWS S3 wrapper)](https://uploadthing.com/)
- [Prisma](https://www.prisma.io/)

### Possible Improvements

- AI autocomplete
- Using a different rich text editor to make it more mobile friendly

## Running Locally

Install the dependencies

```bash
npm install
```

Fill in the environment variables in `.env`. There is an example file provided in `.env.example`. You will need to make an account on [UploadThing](https://uploadthing.com/), [Liveblocks](https://liveblocks.io/) and [Google Cloud Platform](https://cloud.google.com/) (your google account will work) to get API keys. As for the databse URLs, you can host it locally, or you can do what I did and host on [Supabase](https://supabase.com/).

Run in development mode

```bash
npm run dev
```
