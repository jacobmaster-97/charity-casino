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
    selector = f'[data-action="{name}"]'
    for key, value in attrs.items():
        selector += f'[data-{key}="{value}"]'
    page.locator(selector).click()

def overflow(page):
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1')

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.getenv('CASINO_BROWSER', '/usr/bin/chromium'), headless=True,
            args=['--no-sandbox', '--disable-dev-shm-usage', '--disable-crashpad-for-testing'])
        context = browser.new_context(viewport={'width': 1440, 'height': 1000}, accept_downloads=True, reduced_motion='reduce')
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.add_init_script('let diceIndex=0; crypto.getRandomValues=(array)=>{array[0]=[1,2,3][diceIndex++%3];return array;};')
        page.goto(URL)
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
        assert errors == [], errors
        context.close()
        for width, height in [(720,1280),(1080,2400),(390,844),(320,568)]:
            mobile = browser.new_context(viewport={'width':width,'height':height}, is_mobile=True, has_touch=True, reduced_motion='reduce')
            page = mobile.new_page()
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(URL)
            start(page, '手機測試')
            overflow(page)
            page.screenshot(path=str(OUT / f'prototype-lobby-{width}.png'), full_page=True)
            page.locator('[data-action=table]').tap()
            for group in ['大小','單點','對子','圍骰','總點數','兩骰組合']:
                page.locator(f'[data-action=group][data-group="{group}"]').tap()
                overflow(page)
            page.screenshot(path=str(OUT / f'prototype-table-{width}.png'), full_page=True)
            act(page,'rules')
            expect(page.get_by_role('dialog')).to_be_visible()
            act(page,'close-overlay')
            mobile.close()
        assert errors == [], errors
        browser.close()
        print('Browser smoke passed: play, pause, shop, checkpoint, reload, corrupt import, visibility handler and viewport overflow.')

if __name__ == '__main__':
    main()
