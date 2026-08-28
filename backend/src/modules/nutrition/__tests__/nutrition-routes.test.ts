import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../../../app.js';
import { NutritionService, STAPLE_FOODS } from '../nutrition.service.js';

describe('Nutrition Module API Routes & Guardrails', () => {
  const app = buildApp();
  const service = new NutritionService();

  it('GET /api/v1/nutrition/foods rejects unauthenticated request with 401', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/nutrition/foods',
    });

    assert.equal(response.statusCode, 401);
    const body = JSON.parse(response.body);
    assert.equal(body.error, 'Unauthorized');
  });

  it('POST /api/v1/nutrition/foods rejects unauthenticated request with 401', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/nutrition/foods',
      payload: {
        name: 'Whey Protein',
        servingSize: 30,
        servingUnit: 'g',
        calories: 120,
        protein: 24,
        carbohydrates: 2,
        fat: 1,
      },
    });

    assert.equal(response.statusCode, 401);
  });

  it('GET /api/v1/nutrition/meals rejects unauthenticated request with 401', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/nutrition/meals',
    });

    assert.equal(response.statusCode, 401);
  });

  it('POST /api/v1/nutrition/meals rejects unauthenticated request with 401', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/nutrition/meals',
      payload: {
        mealType: 'breakfast',
        loggedDate: '2026-09-14',
        items: [
          {
            name: 'Whole Egg',
            servingQty: 2,
            servingUnit: 'piece',
            calories: 144,
            protein: 12.6,
            carbohydrates: 0.8,
            fat: 9.6,
          },
        ],
      },
    });

    assert.equal(response.statusCode, 401);
  });

  it('GET /api/v1/nutrition/goals rejects unauthenticated request with 401', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/nutrition/goals',
    });

    assert.equal(response.statusCode, 401);
  });

  it('searchFoods returns staple fitness whole foods correctly', async () => {
    const searchResult = await service.searchFoods('test-user-id', {
      q: 'chicken',
      page: 1,
      limit: 10,
    });

    assert.ok(searchResult.items.length > 0);
    assert.ok(searchResult.items[0].name.toLowerCase().includes('chicken'));
    assert.equal(searchResult.items[0].protein, 31.0);
  });

  it('searchFoods by barcode finds exact product if matched', async () => {
    const searchResult = await service.searchFoods('test-user-id', {
      barcode: '0748927028669',
      page: 1,
      limit: 10,
    });

    assert.equal(searchResult.items.length, 1);
    assert.equal(searchResult.items[0].name, 'Whey Protein Isolate (1 Scoop)');
  });

  it('logMeal implements the Macro Snapshotting Guardrail', async () => {
    // When food items are logged to a meal, calories and macronutrients MUST be snapshot
    const meal = await service.logMeal('test-user-id', {
      mealType: 'lunch',
      loggedDate: '2026-09-14T12:30:00.000Z',
      items: [
        {
          foodId: 'staple-chicken-breast',
          name: 'Chicken Breast (Cooked, Skinless)',
          servingQty: 200,
          servingUnit: 'g',
          calories: 330,
          protein: 62.0,
          carbohydrates: 0.0,
          fat: 7.2,
        },
        {
          foodId: 'staple-white-rice',
          name: 'White Rice (Cooked, Jasmine)',
          servingQty: 150,
          servingUnit: 'g',
          calories: 195,
          protein: 4.1,
          carbohydrates: 42.3,
          fat: 0.5,
        },
      ],
    });

    assert.equal(meal.mealType, 'lunch');
    assert.equal(meal.items.length, 2);

    const chicken = meal.items[0];
    assert.equal(chicken.calories, 330);
    assert.equal(chicken.protein, 62);
    assert.equal(chicken.carbohydrates, 0);
    assert.equal(chicken.fat, 7.2);

    const rice = meal.items[1];
    assert.equal(rice.calories, 195);
    assert.equal(rice.protein, 4.1);
    assert.equal(rice.carbohydrates, 42.3);
  });

  it('getDailyGoals returns calibrated default targets when no custom goal is configured', async () => {
    const goals = await service.getDailyGoals('user-without-custom-goals');
    assert.equal(goals.calorieTarget, 2200);
    assert.equal(goals.proteinTarget, 160);
    assert.equal(goals.carbsTarget, 240);
    assert.equal(goals.fatTarget, 65);
    assert.equal(goals.waterTargetMl, 2500);
  });
});
