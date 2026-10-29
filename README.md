# Gather — phone-to-web event livestream

A lightweight, responsive event viewer for Vercel, with a shared access code and a server-checked, eight-hour session. No npm dependencies or build step.

**Phone running Larix → Cloudflare Stream → this website → viewers.**

The phone captures video/audio and sends it straight to the streaming provider. No computer, Iriun or OBS is needed. Vercel serves the website and access gate; it does not receive RTMP or distribute the live video itself.

## Try the demo

```sh
npm run dev
```

Open http://localhost:3471 and enter **event2026**. This default works only locally; Vercel requires your own credentials. The demo plays a bundled eight-second test clip with a test tone, not a live event. Viewers have reconnect, copy-link and leave controls.

```sh
npm test
```

## Deploy to Vercel

1. Import this GitHub repository into Vercel.
2. Framework preset: **Other**. Output directory: **public**. No build command; leave the dashboard Build Command override off. The root `api/access.js` runs as a Vercel Node.js Function.
3. Add the server environment variables below to Production (and Preview if needed).
4. Deploy. Share your Vercel website URL and give invited viewers the access code separately. Ensure Vercel deployment protection allows your intended audience to reach the site; this app supplies its own event code gate.

| Variable | Value |
| --- | --- |
| `EVENT_PASSWORD` | Shared access code for viewers. Required on Vercel. |
| `SESSION_SECRET` | Random server secret. Required on Vercel. Generate using `openssl rand -hex 32`. |
| `STREAM_EMBED_URL` | HTTPS iframe player URL from Cloudflare Stream. Leave empty to use the demo clip. |

Never put a stream key or secret into browser JavaScript or a public repository. None of these variables should have a public prefix. Redeploy after updating environment variables. For local custom values, copy `.env.example` to `.env.local`, fill it in and run `node --env-file=.env.local dev.mjs` (the ordinary dev command does not auto-load env files).

## Connect Larix on your phone

1. Create a **Live Input** in Cloudflare Stream. Enable automatic recording if you also want a provider-side replay. Cloudflare Stream is a separate paid service.
2. Install **Larix Broadcaster** on Android or iPhone. Open Settings → Connections → add a connection. Choose video and audio streaming. Enter the RTMPS connection URL using the server address and stream key provided by Cloudflare. Larix's connection URL combines the server URL with the stream key, separated by `/`; follow the provider's exact values and avoid adding an extra slash. Keep this full publishing URL private.
3. Start with H.264 video, AAC audio, 720p at 30 fps, and roughly 2–3 Mbps video bitrate. These are starting settings; test and adjust for the phone and upload connection. Use stable Wi-Fi or mobile data and keep the phone powered and the app in the foreground.
4. To keep a copy on the phone, enable Larix's local recording feature and test it alongside streaming. Check the installed version's recording options, subscription and duration limits before the event. Local recording is separate from Cloudflare's recording.
5. In Cloudflare's Live Input page, copy the iframe embed **src URL**, not the full HTML or RTMPS publishing URL. Set it as `STREAM_EMBED_URL` in Vercel. Use the **Live Input ID** so the same website follows the active broadcast across phone reconnects:

   ```text
   https://customer-<CODE>.cloudflarestream.com/<LIVE_INPUT_ID>/iframe
   ```

6. Start broadcasting in Larix. Confirm Cloudflare's preview receives video and audio, then visit the website on a second device using a different connection. Enter the event code and press play. The provider player shows its offline state before a broadcast starts; viewers can use **Reconnect** if playback stalls.
7. Share the website link with viewers. **Copy viewer link** never includes the password or stream key. A viewer may need to press play or unmute due to browser autoplay rules.

The website cannot turn the phone camera on or start Larix remotely. Start/stop and local recording are controlled on the phone. For replay after the event, replace the Live Input player URL with the specific recorded Video ID's iframe URL, then redeploy.

## Security and scope

The server checks the code and sets an HttpOnly signed cookie. Production fails closed if credentials are missing. The embed URL is returned only after authentication. This is a simple shared-code gate: an admitted viewer can inspect and share the provider playback URL. For stronger privacy, add short-lived provider-signed playback tokens and allowed-origin restrictions. Configure durable rate limiting for POST `/api/access` at the hosting edge before the public event; this demo does not include a brute-force limiter. Rotate `SESSION_SECRET` to revoke all sessions; password changes alone do not revoke existing cookies.

No phone feed is connected in the repository. Authentication is tested locally; real camera, audio, recording, provider delivery, and event-length testing require your phone and streaming account.

## Official setup references

- [Larix connection URLs and platform documentation](https://softvelum.com/larix/docs/)
- [Create a Cloudflare live input](https://developers.cloudflare.com/stream/stream-live/start-stream-live/)
- [Live Input player URLs and offline behavior](https://developers.cloudflare.com/stream/stream-live/watch-live-stream/)
