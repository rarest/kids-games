# 峰谷竞速 · 幻想场景与机关

**Goal:** Extend the published racer with neon corridors, cyberpunk city, glass/grid sky bridges and a Chinese cultivation-world route with clouds and pavilions, plus avoidable hazards and T-shaped respawn checkpoints.

- Preserve original six routes, four cars, six skins, eleven racers, podium awards and persistent garage.
- Initial four routes: neon tube corridor, cyber city, sky bridge, cloud-temple world. Bridge halves are transparent glass and open steel grating, both drivable.
- Every arena has a T-shaped respawn marker at its lap start. Collisions with dangerous obstacles/pavilions or falling from the bridge incur five seconds stationary; return to current lap's T point, preserving completed laps and prize eligibility. AI follows the same collision and penalty rules.
- Roadblock, swinging pendulum, spiked posts, rotating blade and timed nail patches are spaced apart with early warning and clear lanes. First hazard starts well after the starting grid; respawn grants temporary protection.
- Tests cover route configuration, warning lead time, clear space, swept collisions, five-second pause/respawn, lap preservation, AI avoidance and podium payouts after a crash. Browser checks exercise all new worlds, controls and checkpoint rendering. Review, deploy and verify public gameplay and resource hashes.

- Latest scope: 14 independently authored course shapes; original theme routes stay in one environment. Add container roof/interior, sea cable bridge, a two-level crossing ship route, and Chinese river gorge. Add dawn/noon/sunset/night with manual selection and smooth auto light/reflection transitions, stronger headlight/shadow contrast, welcoming pines, layered trees, bushes and flower islands.

- Follow-up fixes: chase-camera left/right controls, solid car separation even during cooldown, finished cars leave the racing lane, reshaped aero/arches/LED car models and batched neon trails that intensify under nitro.

## Progress
- [x] Core hazard rules and regression tests.
- [x] Four environments, obstacle models/animation, checkpoint and warning UI.
- [x] Browser verification and independent review: 326 unit checks, all 17 browser suites / 30 checks, zero folded road faces, 22m ship overpass clearance.
- [ ] Merge, release and public acceptance (runtime receipt: /home/ubuntu/codex-work/output/racing/RESULT.md).

- [x] User follow-up: shooter waves 51 through 10000 each contain 20 random big bosses. Red at wave 52 on old core; full 326 unit checks green, campaign browser checks 51/52/101/10000, coop/latency/responsive regressions green. Shared solo/server core and bounded 3-boss spawn batches independently reviewed.
