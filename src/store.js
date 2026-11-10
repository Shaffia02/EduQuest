import { create } from 'zustand'

let flashTimeoutId = null

export const useStore = create((set, get) => ({
  quests: {
    dataNode: false,
    commsNode: false
  },
  mathStage: 0,
  mathTotal: 10,
  engStage: 0,
  engTotal: 10,
  activeTerminal: null,
  systemStatus: 'COMPROMISED',
  nearTerminal: null,
  attempts: {
    dataNode: 0,
    commsNode: 0
  },
  showFlash: false,

  openTerminal: (id) => {
    const { quests } = get()
    if (!id || quests[id]) return
    set({ activeTerminal: id })
  },

  closeTerminal: () => {
    set({ activeTerminal: null })
  },

  advanceMathStage: () => {
    const { mathStage, mathTotal } = get()
    if (mathStage + 1 < mathTotal) {
      set({ mathStage: mathStage + 1 })
      return false
    }
    return true
  },

  advanceEngStage: () => {
    const { engStage, engTotal } = get()
    if (engStage + 1 < engTotal) {
      set({ engStage: engStage + 1 })
      return false
    }
    return true
  },

  completeQuest: (id) => {
    const nextQuests = { ...get().quests, [id]: true }
    const allComplete = Boolean(nextQuests.dataNode && nextQuests.commsNode)

    if (allComplete) {
      if (flashTimeoutId) clearTimeout(flashTimeoutId)
      set({
        quests: nextQuests,
        activeTerminal: null,
        systemStatus: 'SECURED',
        showFlash: true
      })
      flashTimeoutId = setTimeout(() => {
        set({ showFlash: false })
        flashTimeoutId = null
      }, 1500)
    } else {
      set({
        quests: nextQuests,
        activeTerminal: null
      })
    }
  },

  setNearTerminal: (id) => {
    if (get().nearTerminal === id) return
    set({ nearTerminal: id })
  },

  registerAttempt: (id) => {
    set((state) => ({
      attempts: {
        ...state.attempts,
        [id]: (state.attempts[id] || 0) + 1
      }
    }))
  },

  resetGame: () => {
    if (flashTimeoutId) {
      clearTimeout(flashTimeoutId)
      flashTimeoutId = null
    }
    set({
      quests: { dataNode: false, commsNode: false },
      mathStage: 0,
      engStage: 0,
      activeTerminal: null,
      systemStatus: 'COMPROMISED',
      nearTerminal: null,
      attempts: { dataNode: 0, commsNode: 0 },
      showFlash: false
    })
  }
}))
