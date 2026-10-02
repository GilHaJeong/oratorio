# 대원용 리허설 웹앱 (Sonnet 5.5 · 2026-10-03)
- 실행: `python3 -m http.server` 후 index.html (?screen=cover|first_run_part_select|home|progress_all|practice)
- 표시 문구: contract/ui-copy.json v0.4.2 키만 사용. 표지 문구는 계약에 없어 app.js COVER 상수(역제안 대상).
- 토큰: style.css :root (design-tokens v0.4.0 값 그대로). 질감: assets/*.webp (2048/1640/780).
- 미구현: song_detail(서사·구간 자료 미전달), 음원 재생·악보 이미지(자료 0/6), 자료 받기(오프라인) 흐름.
- data/songs.json 은 개발용 최소본(No.1 한 곡). 실제 36곡 자료로 교체 필요.
