# Tweet queue

Raw tweet ideas to post when ready. Newest at top. Pull one, polish, post, delete the line.

---

### Drafted Jun 6, 2026 (vibe pillar test batch)

- [vibe · take · Jun 6, 2026] your vibe coded app doesn't need tests yet. it needs backups. one of these kills you tomorrow. the other is a luxury you grow into.

- [vibe · take · Jun 6, 2026] the dangerous part of vibe coding isn't shipping fast. it's the week after it works, when you have real user data and no backups. that's the moment to slow down. not before.

- [vibe · ship: recovery-hash safety net · Jun 6, 2026] shipped a recovery-hash safety net for password reset on my pickleball project. most of the app moves fast and loose. auth never does. that split is the whole discipline: pick the few places where you refuse to vibe.

- [vibe · learning: auth-400-suspect-credentials-before-origin · Jun 6, 2026] a 400 from an auth endpoint looks the same whether the password is wrong or the request got blocked upstream. the status code will anchor you to the wrong theory. diff a working request against the failing one before you trust the error.

- [vibe · learning: automating-a-channel-you-also-post-to-by-hand · Jun 6, 2026] my auto poster kept treating posts i'd made by hand as fresh content. its logic was fine. its "already posted" record only knew what it posted itself. automate a channel you also touch by hand and the bugs will live at the boundary between you and the bot.

- [vibe · callout · Jun 6, 2026] if your ai-built app suddenly has real users and that scares you, the fear is accurate. it's also a weekend of work. start with backups. everything else can stay duct tape a while longer.

### Drafted Jun 5, 2026

- [build · ship: pickleradar first signs of life · Jun 5, 2026] pickleradar's first signs of life, all small, all real: a stranger submitted a tournament, the first email subscriber showed up, and views keep climbing since launch (best day so far: 38). not vanity numbers. just the first few humans showing up.

- [teach · learning: impressions-arent-follows · Jun 5, 2026] a reply can't earn you a follow. it earns the profile click. the follow gets decided at your profile in ~2 seconds: bio, pinned tweet, last 3 tweets. if those don't say "worth following," every impression just leaks out. fix your profile before you grind for reach.

- [teach · learning: x-image-dupe-media-vs-link-card · Jun 5, 2026] x gotcha worth knowing: attaching an image suppresses the link card for a url in the same tweet. so a duplicate link only appears when the image and the url live on different tweets (card on the head, link on a reply). you only catch it across a thread.

- [take · learning: ai-fabricated-causality · Jun 5, 2026] the most dangerous number isn't a fake metric. it's a fake cause. "i promoted it and it worked" slides right past you because it's the story you wanted. a made-up number looks wrong. a plausible "because" looks like insight. check the dates before you trust your own narrative.

- [tool · queue: claude code clipboard hack · Jun 5, 2026] tiny claude code QoL win: set mac screenshots to save to the clipboard, then ctrl+v pastes them straight into the terminal. no file hunting. command: defaults write com.apple.screencapture target clipboard && killall SystemUIServer (revert with target file).

---

- **Claude Code terminal QoL hack.** Adjust your Mac settings so screenshots save straight to the clipboard, then ctrl+V pastes them right into Claude in the terminal. Very quick loop, no file-hunting. _(Jun 3, 2026)_
  - Make it the default: `defaults write com.apple.screencapture target clipboard && killall SystemUIServer` (revert with `target file`).
  - Or one-off without changing the default: `Cmd+Ctrl+Shift+4` sends that single screenshot straight to the clipboard.
- **PostHog AI for funnels (build-in-public angle).** So many products have AI just bolted on lately. But as a newbie, having PostHog's AI there to not only make sense of the data but suggest how to construct and instrument funnels is pretty dope. _(Jun 3, 2026)_
