import { renderHook, act } from '@testing-library/react'
import { useSavedRecipes } from './useSavedRecipes'

const localStorageMock = (function () {
  let store: Record<string, string> = {}
  return {
    getItem(key: string) {
      return store[key] || null
    },
    setItem(key: string, value: string) {
      store[key] = value.toString()
    },
    clear() {
      store = {}
    },
    removeItem(key: string) {
      delete store[key]
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useSavedRecipes', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('should initialize with empty recipes', () => {
    const { result } = renderHook(() => useSavedRecipes())
    expect(result.current.savedRecipes).toEqual([])
  })

  it('should save a recipe', () => {
    const { result } = renderHook(() => useSavedRecipes())
    const mockRecipe = {
      id: '1',
      originalDish: 'Pizza',
      selectedGoals: [],
      selectedConstraints: [],
      sliderWeights: { tasteRetention: 50, healthiness: 50, convenience: 50 },
      recipe: { title: 'Healthy Pizza', ingredientSwaps: [], additions: [], shoppingList: [], metrics: {} },
      createdAt: Date.now()
    }
    
    act(() => {
      result.current.saveRecipe(mockRecipe)
    })

    expect(result.current.savedRecipes).toHaveLength(1)
    expect(result.current.savedRecipes[0].id).toBe('1')
  })
})
