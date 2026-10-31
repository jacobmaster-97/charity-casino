"""Run in an environment that permits Chromium IPC. Not executed successfully in the current sandbox.

CASINO_BROWSER=/path/to/chromium python tests/browser_smoke.py
Requires existing Playwright Python and a Chromium installation. No browser install is attempted.
"""
import json
import os
import re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
URL = (ROOT / 'dist/charity-casino-prototype.html').as_uri()
OUT = ROOT / 'docs/previews'

def start(page, player='試玩者'):
    page.locator('#player-name').fill(player)
    page.locator('#start-form button[type=submit]').click()
    page.locator('[data-action=enter]').click()

def act(page, name, **attrs):
    if name == 'table' and 'table' not in attrs:
        attrs['table'] = 'sicbo'
    selector = f'[data-action="{name}"]'
    for key, value in attrs.items():
        selector += f'[data-{key}="{value}"]'
    if name in ['leave', 'next', 'roll', 'pause'] and page.locator('.table-tool-dialog[open]').count():
        page.locator('[data-action=close-table-tool]').click()
    if name == 'remove' and not page.locator('details.bet-details').evaluate('(n)=>n.open'):
        page.locator('details.bet-details summary').click()
    page.locator(selector).click()

def overflow(page):
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1')
    if page.locator('.table-shell').count() and not page.locator('.board-scroll.is-zoomed').count():
        assert page.evaluate('document.documentElement.scrollHeight <= window.innerHeight + 1')
        for selector in ['.table-nav', '.console-dock', '.action-area', '.chip-picker', '.console-tools']:
            node = page.locator(selector)
            if node.count():
                box = node.bounding_box()
                assert box and box['y'] >= 0 and box['y'] + box['height'] <= page.viewport_size['height'] + 1, (selector, box)


def roulette_composition(page):
    boxes = page.evaluate("""() => {
      const rect = s => { const r=document.querySelector(s).getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}; };
      return {layout:rect('.roulette-layout'),bets:rect('.roulette-console'),wheel:rect('.rou-stage')};
    }""")
    bets, wheel, layout = boxes['bets'], boxes['wheel'], boxes['layout']
    assert bets['right'] <= wheel['x'] + 1, boxes
    assert abs(bets['y'] - wheel['y']) < 1, boxes
    assert abs(bets['height'] - wheel['height']) < 1, boxes
    assert abs(bets['width'] / (bets['width'] + wheel['width']) - 0.6) < 0.01, boxes
    assert bets['x'] >= layout['x'] - 1 and wheel['right'] <= layout['right'] + 1, boxes

def baccarat_composition(page):
    # Requires real browser geometry; not run in the restricted IPC environment.
    page.wait_for_function("""() => {
      const board=document.querySelector('.baccarat-board'), region=document.querySelector('.baccarat-screen .board-scroll');
      if(!board || !region || !region.clientWidth || !region.clientHeight)return false;
      return Math.abs(Number(board.dataset.boardHeight)-1200*region.clientHeight/region.clientWidth)<.01;
    }""")
    geometry = page.locator('.baccarat-felt').evaluate("""felt => {
      const stage=felt.querySelector('.baccarat-stage').getBoundingClientRect(), lower=felt.querySelector('.baccarat-lower').getBoundingClientRect();
      return {stage:stage.height, lower:lower.height, upperBottom:stage.bottom, lowerTop:lower.top};
    }""")
    assert abs(geometry['stage'] / geometry['lower'] - 35 / 65) < .02
    assert geometry['upperBottom'] <= geometry['lowerTop'] + 1
    overflow(page)

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.getenv('CASINO_BROWSER', '/usr/bin/chromium'), headless=True,
            args=['--no-sandbox', '--disable-dev-shm-usage', '--disable-crashpad-for-testing'])
        context = browser.new_context(viewport={'width': 1440, 'height': 1000}, accept_downloads=True, reduced_motion='reduce')
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.add_init_script('let diceIndex=0; crypto.getRandomValues=(array)=>{array[0]=[1,2,3][diceIndex++%3];return array;};')
        page.goto(URL)
        expect(page.locator('[data-action=sound]')).to_have_attribute('aria-pressed', 'true')
        act(page, 'sound')
        expect(page.locator('[data-action=sound]')).to_have_attribute('aria-pressed', 'false')
        page.reload()
        expect(page.locator('[data-action=sound]')).to_have_attribute('aria-pressed', 'false')
        act(page, 'sound')
        expect(page.locator('#player-name')).to_be_visible()
        page.screenshot(path=str(OUT / 'prototype-home.png'), full_page=True)
        start(page)
        act(page, 'shop')
        before = page.locator('#elapsed').inner_text()
        page.wait_for_timeout(1100)
        assert page.locator('#elapsed').inner_text() == before
        for item in ['protect', 'peek', 'reroll']:
            act(page, 'buy', item=item)
        expect(page.locator('#bank-value')).to_have_text('$72.90')
        act(page, 'close-shop')
        page.screenshot(path=str(OUT / 'prototype-lobby.png'), full_page=True)
        act(page, 'table')
        act(page, 'bet', bet='small')
        act(page, 'pause')
        expect(page.locator('.modal [data-action=sound]')).to_be_visible()
        act(page, 'sound')
        expect(page.locator('.modal [data-action=sound]')).to_have_attribute('aria-pressed', 'false')
        act(page, 'sound')
        remaining = page.locator('#countdown').text_content()
        page.wait_for_timeout(1200)
        assert page.locator('#countdown').text_content() == remaining
        expect(page.get_by_role('dialog')).to_be_visible()
        act(page, 'resume')
        act(page, 'roll')
        expect(page.locator('[data-action=accept]')).to_be_visible()
        act(page, 'accept')
        expect(page.locator('.result-box')).to_contain_text('贏得')
        expect(page.locator('#bank-value')).to_have_text('$77.90')
        page.screenshot(path=str(OUT / 'prototype-result.png'), full_page=True)
        act(page, 'leave')
        act(page, 'saves')
        with page.expect_download() as info:
            act(page, 'export')
        downloaded = info.value
        snapshot = json.loads(Path(downloaded.path()).read_text())
        assert snapshot['profile']['rounds'] == 1
        assert snapshot['profile']['inventory']['reroll'] == 0
        assert snapshot['profile']['bank'] == 7790
        act(page, 'close-overlay')
        act(page, 'table')
        page.locator('details.inventory summary').click()
        page.locator('#peek-index').select_option('2')
        act(page, 'use', item='peek')
        expect(page.locator('.insight')).to_contain_text('高點 4–6')
        act(page, 'bet', bet='small')
        act(page, 'roll')
        page.reload()  # Discard this unfinished round.
        act(page, 'continue')
        expect(page.locator('#bank-value')).to_have_text('$77.90')
        act(page, 'saves')
        page.locator('#import-file').set_input_files({'name': 'bad.json', 'mimeType': 'application/json', 'buffer': b'{broken'})
        expect(page.locator('#toast')).to_contain_text('匯入失敗')
        expect(page.locator('#bank-value')).to_have_text('$77.90')
        act(page, 'close-overlay')
        page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))")
        expect(page.get_by_role('dialog', name='遊戲已暫停')).to_be_visible()
        page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'))")
        expect(page.get_by_role('dialog')).to_be_visible()  # Only Continue resumes.
        act(page, 'resume')
        # Restore a rich completed checkpoint through the normal import flow.
        # This path verifies the live chip controls without a gameplay debug API.
        act(page, 'saves')
        rich = json.loads(json.dumps(snapshot))
        rich['profile']['bank'] = 100000000  # $1,000,000
        page.locator('#import-file').set_input_files({'name':'rich.json','mimeType':'application/json','buffer':json.dumps(rich).encode()})
        act(page, 'table')
        large = page.locator('[data-action=chip][data-chip="10000000"]')
        expect(large).to_be_visible()
        expect(large).to_have_attribute('aria-label', '選擇 $100,000 籌碼')
        large.click()
        expect(page.locator('[data-action=chip][data-chip="10000000"]')).to_be_focused()
        expect(page.locator('#custom-amount')).to_have_value('100000')
        values = page.locator('.chip-picker button').evaluate_all('(nodes)=>nodes.map(n=>n.dataset.chip)')
        act(page, 'bet', bet='small')
        expect(page.locator('.bet-list')).to_contain_text('$100,000')
        assert page.locator('.chip-picker button').evaluate_all('(nodes)=>nodes.map(n=>n.dataset.chip)') == values
        act(page, 'remove', bet='small')
        expect(page.locator('#custom-amount')).to_have_value('100000')
        act(page, 'leave')
        act(page, 'home')
        start(page, '新挑戰')
        act(page, 'table')
        expect(page.locator('#custom-amount')).to_have_value('5')
        assert errors == [], errors
        # Fixed legal shoe through the normal completed-save import; no runtime debug API.
        act(page, 'leave')
        act(page, 'saves')
        squeeze_save = json.loads(json.dumps(snapshot))
        squeeze_save['profile']['bank'] = 10000
        initial = [0, 1, 2, 3, 5, 6]
        squeeze_save['baccaratShoe'] = {'cards': initial + [n for n in range(416) if n not in initial], 'cursor': 0, 'cycle': 1}
        page.locator('#import-file').set_input_files({'name':'squeeze.json','mimeType':'application/json','buffer':json.dumps(squeeze_save).encode()})
        page.locator('[data-action=table][data-table=baccarat]').click()
        expect(page.locator('.baccarat-screen')).to_be_visible()
        baccarat_composition(page)
        expect(page.locator('.baccarat-board .printed-cell')).to_have_count(6)
        act(page, 'bet', bet='bac-player')
        stake_before_move = page.locator('.console-summary strong').first.inner_text()
        act(page, 'bet', bet='bac-banker')
        assert page.locator('.console-summary strong').first.inner_text() == stake_before_move
        expect(page.locator('.console-summary')).to_contain_text('莊')
        act(page, 'pause')
        expect(page.get_by_role('dialog')).to_be_visible()
        act(page, 'resume')
        act(page, 'roll')
        scene = page.locator('#squeeze-scene')
        expect(page.locator('[data-action=squeeze-reveal]')).to_be_enabled(timeout=6000)
        bounds = scene.bounding_box()
        x, y = bounds['x'] + bounds['width'] * .65, bounds['y'] + bounds['height'] * .7
        page.mouse.move(x, y)
        page.mouse.down()
        page.mouse.move(x - 8, y - 8, steps=5)
        page.mouse.up()
        progress = scene.get_attribute('aria-valuenow')
        assert int(progress) > 0
        page.locator('.squeeze-panel [data-action=pause]').click()
        page.wait_for_timeout(1100)
        act(page, 'resume')
        assert scene.get_attribute('aria-valuenow') == progress
        scene.press('ArrowLeft')
        act(page, 'squeeze-reveal')
        expect(page.locator('.baccarat-screen [data-action=next]')).to_be_visible(timeout=5000)
        page.screenshot(path=str(OUT / 'prototype-baccarat-result.png'), full_page=True)
        act(page, 'leave')
        act(page, 'saves')
        with page.expect_download() as bac_download:
            act(page, 'export')
        bac_snapshot = json.loads(Path(bac_download.value.path()).read_text())
        assert len(bac_snapshot['baccaratShoe']['cards']) == 416
        assert bac_snapshot['baccaratShoe']['cursor'] >= 4
        act(page, 'close-overlay')
        # Blackjack: deterministic split + double through the normal saved-shoe import.
        act(page, 'saves')
        bj_save = json.loads(json.dumps(bac_snapshot))
        bj_save['profile']['bank'] = 10000
        bj_first = [7, 9, 20, 6, 2, 3, 61]
        bj_save['blackjackShoe'] = {'cards': bj_first + [n for n in range(312) if n not in bj_first], 'cursor': 0, 'cycle': 1}
        page.locator('#import-file').set_input_files({'name':'blackjack.json','mimeType':'application/json','buffer':json.dumps(bj_save).encode()})
        page.locator('[data-action=table][data-table=blackjack]').click()
        expect(page.locator('.blackjack-felt')).to_be_visible()
        overflow(page)
        act(page, 'bet', bet='bj-main')
        act(page, 'roll')
        expect(page.locator('[data-bj-action=split]')).to_be_enabled(timeout=6000)
        page.locator('[data-bj-action=split]').click()
        act(page, 'pause')
        elapsed = page.locator('#elapsed').text_content()
        page.wait_for_timeout(1100)
        assert page.locator('#elapsed').text_content() == elapsed
        act(page, 'resume')
        expect(page.locator('[data-bj-action=double]')).to_be_enabled(timeout=5000)
        page.locator('[data-bj-action=double]').click()
        expect(page.locator('.bj-active header')).to_contain_text('第 2 手', timeout=5000)
        page.locator('[data-bj-action=stand]').click()
        expect(page.locator('.blackjack-screen [data-action=next]')).to_be_visible(timeout=5000)
        expect(page.locator('#bank-value')).to_have_text('$105')
        page.screenshot(path=str(OUT / 'prototype-blackjack-result.png'), full_page=True)
        act(page, 'leave')
        act(page, 'saves')
        with page.expect_download() as bj_download:
            act(page, 'export')
        bj_snapshot = json.loads(Path(bj_download.value.path()).read_text())
        assert len(bj_snapshot['blackjackShoe']['cards']) == 312
        assert bj_snapshot['blackjackShoe']['cursor'] == 7
        assert bj_snapshot['profile']['rounds'] == bj_save['profile']['rounds'] + 1
        act(page, 'close-overlay')
        page.locator('[data-action=table][data-table=poker]').click()
        expect(page.locator('.poker-felt')).to_be_visible()
        overflow(page)
        page.locator('.shoe-details summary').click()
        act(page, 'pk-speed', speed='fast')
        act(page, 'close-table-tool')
        act(page, 'pk-start')
        for _ in range(180):
            if page.locator('.pk-result').count():
                break
            if page.locator('[data-poker-action=fold]').count():
                overflow(page)
                page.screenshot(path=str(OUT / 'prototype-poker-turn.png'), full_page=True)
                act(page, 'pause')
                clock = page.locator('#elapsed').text_content()
                page.wait_for_timeout(1100)
                assert page.locator('#elapsed').text_content() == clock
                act(page, 'resume')
                page.locator('[data-poker-action=fold]').click()
            page.wait_for_timeout(300)
        expect(page.locator('.pk-result')).to_be_visible()
        act(page, 'leave')
        act(page, 'saves')
        with page.expect_download() as poker_download:
            act(page, 'export')
        poker_snapshot = json.loads(Path(poker_download.value.path()).read_text())
        assert len(poker_snapshot['pokerTable']['seats']) == 5
        assert poker_snapshot['pokerTable']['speed'] == 'fast'
        assert poker_snapshot['blackjackShoe'] == bj_snapshot['blackjackShoe']
        assert poker_snapshot['profile']['rounds'] == bj_snapshot['profile']['rounds'] + 1
        act(page, 'close-overlay')
        page.locator('[data-action=table][data-table=roulette]').click()
        expect(page.locator('.roulette-board')).to_be_visible()
        roulette_composition(page)
        expect(page.locator('.rou-cell')).to_have_count(50)
        overflow(page)
        act(page, 'bet', bet='rou-number-0')
        act(page, 'roll')
        act(page, 'pause')
        roulette_clock = page.locator('#elapsed').text_content()
        page.wait_for_timeout(1100)
        assert page.locator('#elapsed').text_content() == roulette_clock
        act(page, 'resume')
        expect(page.locator('.roulette-screen [data-action=next]')).to_be_visible(timeout=7000)
        page.screenshot(path=str(OUT / 'prototype-roulette-result.png'), full_page=True)
        act(page, 'leave')
        act(page, 'saves')
        with page.expect_download() as roulette_download:
            act(page, 'export')
        roulette_snapshot = json.loads(Path(roulette_download.value.path()).read_text())
        assert roulette_snapshot['profile']['rounds'] == poker_snapshot['profile']['rounds'] + 1
        assert roulette_snapshot['pokerTable'] == poker_snapshot['pokerTable']
        assert roulette_snapshot['blackjackShoe'] == poker_snapshot['blackjackShoe']
        assert roulette_snapshot['baccaratShoe'] == poker_snapshot['baccaratShoe']
        context.close()
        for width, height in [(720,1280),(1080,2400),(390,844),(320,568),(844,390),(768,1024),(1024,768)]:
            mobile = browser.new_context(viewport={'width':width,'height':height}, is_mobile=True, has_touch=True, reduced_motion='reduce')
            page = mobile.new_page()
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(URL)
            start(page, '手機測試')
            overflow(page)
            page.screenshot(path=str(OUT / f'prototype-lobby-{width}.png'), full_page=True)
            page.locator('[data-action=table][data-table=sicbo]').tap()
            expect(page.locator('.printed-cell')).to_have_count(50)
            page.locator('[data-action=bet][data-bet=small]').tap()
            expect(page.locator('.board-amounts')).to_contain_text('5')
            overflow(page)
            page.locator('[data-action=bet][data-bet=big]').scroll_into_view_if_needed()
            page.locator('[data-action=bet][data-bet=big]').tap()
            expect(page.locator('.bet-list')).to_contain_text('大')
            assert page.locator('.board-scroll').evaluate('(n)=>n.scrollWidth<=n.clientWidth+1')
            assert page.locator('aside.bet-panel').count() == 0
            assert page.locator('.chip-picker [data-color]').count() == 5
            act(page, 'board-zoom')
            assert page.locator('.board-scroll').evaluate('(n)=>n.scrollWidth>n.clientWidth')
            act(page, 'board-zoom')
            page.screenshot(path=str(OUT / f'prototype-table-{width}.png'), full_page=True)
            act(page,'rules')
            expect(page.get_by_role('dialog')).to_be_visible()
            act(page,'close-overlay')
            act(page, 'clear')
            act(page, 'leave')
            page.locator('[data-action=table][data-table=baccarat]').tap()
            overflow(page)
            expect(page.locator('.baccarat-screen')).to_be_visible()
            baccarat_composition(page)
            page.locator('[data-action=bet][data-bet=bac-player]').tap()
            page.screenshot(path=str(OUT / f'prototype-baccarat-{width}.png'), full_page=True)
            act(page, 'clear')
            act(page, 'leave')
            page.locator('[data-action=table][data-table=blackjack]').tap()
            expect(page.locator('.blackjack-felt')).to_be_visible()
            overflow(page)
            page.locator('[data-action=bet][data-bet=bj-main]').tap()
            expect(page.locator('.bj-chip-target')).to_contain_text('5')
            page.screenshot(path=str(OUT / f'prototype-blackjack-{width}.png'), full_page=True)
            act(page, 'clear')
            act(page, 'leave')
            page.locator('[data-action=table][data-table=roulette]').tap()
            expect(page.locator('.rou-cell')).to_have_count(50)
            overflow(page)
            roulette_composition(page)
            page.locator('.roulette-screen .precise-bet summary').tap()
            page.locator('#roulette-target').select_option('rou-number-00')
            page.locator('.table-tool-dialog [data-action=bet]').tap()
            act(page, 'close-table-tool')
            expect(page.locator('.roulette-screen .console-summary')).to_contain_text('$5')
            overflow(page)
            page.screenshot(path=str(OUT / f'prototype-roulette-{width}.png'), full_page=True)
            act(page, 'board-zoom')
            assert page.locator('.rou-board-wrap').evaluate('(n)=>n.scrollWidth>n.clientWidth')
            act(page, 'board-zoom')
            act(page, 'clear')
            act(page, 'leave')
            page.locator('[data-action=table][data-table=poker]').tap()
            expect(page.locator('.poker-felt')).to_be_visible()
            overflow(page)
            page.screenshot(path=str(OUT / f'prototype-poker-{width}.png'), full_page=True)
            act(page, 'pk-start')
            for _ in range(80):
                if page.locator('[data-poker-action=fold]').count():
                    overflow(page)
                    page.screenshot(path=str(OUT / f'prototype-poker-turn-{width}.png'), full_page=True)
                    break
                if page.locator('.pk-result').count():
                    break
                page.wait_for_timeout(300)
            mobile.close()
        assert errors == [], errors
        browser.close()
        print('Browser smoke passed: play, pause, shop, checkpoint, reload, corrupt import, visibility handler and viewport overflow.')

if __name__ == '__main__':
    main()
