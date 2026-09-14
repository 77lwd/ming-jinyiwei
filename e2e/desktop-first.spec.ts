import { expect, test } from '@playwright/test'

test('desktop player can enter chapter one and use the fire-scene case desk', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '开始新游戏' }).click()
  await page.getByRole('button', { name: '跳过序章' }).click()

  await expect(page.locator('header').getByText('第一章 · 纸灰里的银子')).toBeVisible()
  await expect(page.getByText('随覃保坤前往城南')).toBeVisible()
  await page.getByRole('button', { name: /随覃百户前往城南/ }).click()

  await expect(page.locator('.game-shell')).toHaveClass(/fire-desk-sample/)
  await expect(page.getByRole('img', { name: /纸铺|火场/ })).toBeVisible()
  await expect(page.getByRole('region', { name: '案件进度' })).toBeVisible()
  await expect(page.getByText('选择调查方向')).toBeVisible()
  await expect(page.getByRole('button', { name: /送样凭条/ })).toBeVisible()

  await page.getByRole('button', { name: '个人档案' }).click()
  await expect(page.getByRole('dialog', { name: '个人档案' })).toBeVisible()
  await page.getByRole('button', { name: '关闭' }).click()

  await page.getByRole('button', { name: '案情记录' }).click()
  await expect(page.getByRole('dialog', { name: '案情记录' })).toBeVisible()
  await page.getByRole('button', { name: '关闭' }).click()

  await page.getByRole('button', { name: '人脉' }).click()
  await expect(page.getByRole('dialog', { name: '人脉' })).toBeVisible()
  await expect(page.getByRole('button', { name: /覃保坤/ })).toBeVisible()
})
