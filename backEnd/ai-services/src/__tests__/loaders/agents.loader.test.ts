import fs from 'fs'
import { Agent } from '@openai/agents'
import loadAgents, { getAgents } from '../../loaders/agents.loader'

jest.mock('@openai/agents', () => ({
  __esModule: true,
  Agent: { create: jest.fn() },
}))

jest.mock('../../agents/prompts', () => ({
  __esModule: true,
  default: {
    chatSummaryPrompt: 'You are a summary agent.',
    relevantInfoPrompt: 'You are a relevant info detector.',
    ltmPrompt: 'You are an LTM extractor.',
    titleGeneratorPrompt: 'You are a title generator.',
  },
}))

jest.mock('../../agents/outputTypes', () => ({
  __esModule: true,
  default: {
    IsRelevantType: { _fake: 'IsRelevantType' },
    LTMList: { _fake: 'LTMList' },
    TitleOutputType: { _fake: 'TitleOutputType' },
  },
}))

jest.mock('../../agents/tools', () => ({
  __esModule: true,
  default: {
    webSearch: { name: 'webSearch' },
  },
}))

// ── Fixtures ───────────────────────────────────────────────────────────────────

const ALL_DEFINITIONS: Record<string, object> = {
  'chat_summary.agent.json': {
    id: 'chat_summary',
    name: 'summary-agent',
    model: 'gpt-4o-mini',
    prompt: 'chatSummaryPrompt',
  },
  'user_info.agent.json': {
    id: 'user_info',
    name: 'user-info-agent',
    model: 'gpt-4o-mini',
    prompt: 'relevantInfoPrompt',
    outputType: 'IsRelevantType',
  },
  'long_memory.agent.json': {
    id: 'long_memory',
    name: 'ltm-agent',
    model: 'gpt-4o-mini',
    prompt: 'ltmPrompt',
    outputType: 'LTMList',
  },
  'title_generator.agent.json': {
    id: 'title_generator',
    name: 'title-agent',
    model: 'gpt-4o-mini',
    prompt: 'titleGeneratorPrompt',
    outputType: 'TitleOutputType',
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const setupFsMock = (files: Record<string, object> = ALL_DEFINITIONS) => {
  jest.spyOn(fs, 'readdirSync').mockReturnValue(Object.keys(files) as any)
  jest.spyOn(fs, 'readFileSync').mockImplementation((filePath: any) => {
    const fileName = Object.keys(files).find(f => String(filePath).includes(f))
    if (!fileName) throw new Error(`Unexpected readFileSync call: ${filePath}`)
    return JSON.stringify(files[fileName])
  })
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('agents.loader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(Agent.create as jest.Mock).mockImplementation((cfg: any) => ({ _agent: cfg.name }))
    setupFsMock()
  })

  describe('getAgents', () => {
    it('returns undefined for an unknown agent id', () => {
      expect(getAgents('unknown_agent' as any)).toBeUndefined()
    })
  })

  describe('loadAgents', () => {
    it('reads all .agent.json files from the definitions directory', () => {
      loadAgents()

      const agentFileCalls = (fs.readFileSync as jest.Mock).mock.calls.filter(
        ([path]) => String(path).endsWith('.agent.json')
      )
      expect(fs.readdirSync).toHaveBeenCalledTimes(1)
      expect(agentFileCalls).toHaveLength(Object.keys(ALL_DEFINITIONS).length)
    })

    it('calls Agent.create once per definition file', () => {
      loadAgents()

      expect(Agent.create).toHaveBeenCalledTimes(Object.keys(ALL_DEFINITIONS).length)
    })

    it('passes name, model, and instructions to Agent.create', () => {
      loadAgents()

      expect(Agent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'summary-agent',
          model: 'gpt-4o-mini',
          instructions: 'You are a summary agent.',
        })
      )
    })

    it('passes outputType to Agent.create when defined in the config', () => {
      loadAgents()

      expect(Agent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'user-info-agent',
          outputType: { _fake: 'IsRelevantType' },
        })
      )
    })

    it('does not include outputType in Agent.create when config has none', () => {
      loadAgents()

      const summaryCall = (Agent.create as jest.Mock).mock.calls.find(
        ([cfg]) => cfg.name === 'summary-agent'
      )
      expect(summaryCall![0]).not.toHaveProperty('outputType')
    })

    it('passes mapped tools when config declares them', () => {
      setupFsMock({
        'chat.agent.json': {
          id: 'chat',
          name: 'chat-agent',
          model: 'gpt-4o-mini',
          prompt: 'chatSummaryPrompt',
          tools: ['webSearch'],
        },
      })
      loadAgents()

      expect(Agent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tools: [{ name: 'webSearch' }],
        })
      )
    })

    it('skips unknown tools and logs a warning', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
      setupFsMock({
        'chat.agent.json': {
          id: 'chat',
          name: 'chat-agent',
          model: 'gpt-4o-mini',
          prompt: 'chatSummaryPrompt',
          tools: ['nonExistentTool'],
        },
      })
      loadAgents()

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('nonExistentTool'))
      expect(Agent.create).toHaveBeenCalledWith(
        expect.objectContaining({ tools: [] })
      )
      warnSpy.mockRestore()
    })

    it('ignores non-.agent.json files in the definitions directory', () => {
      jest.spyOn(fs, 'readdirSync').mockReturnValue([
        'chat_summary.agent.json',
        'README.md',
        '.DS_Store',
      ] as any)
      jest.spyOn(fs, 'readFileSync').mockReturnValue(
        JSON.stringify(ALL_DEFINITIONS['chat_summary.agent.json'])
      )
      loadAgents()

      expect(Agent.create).toHaveBeenCalledTimes(1)
    })

    it('throws when the prompt key is not in the registry', () => {
      setupFsMock({
        'bad.agent.json': {
          id: 'bad',
          name: 'bad-agent',
          model: 'gpt-4o-mini',
          prompt: 'nonExistentPrompt',
        },
      })

      expect(() => loadAgents()).toThrow(/nonExistentPrompt/)
    })

    it('throws when the outputType is not in the registry', () => {
      setupFsMock({
        'bad.agent.json': {
          id: 'bad',
          name: 'bad-agent',
          model: 'gpt-4o-mini',
          prompt: 'chatSummaryPrompt',
          outputType: 'NonExistentOutputType',
        },
      })

      expect(() => loadAgents()).toThrow(/NonExistentOutputType/)
    })
  })

  describe('getAgents (after load)', () => {
    beforeEach(() => loadAgents())

    it('returns the agent instance for each known id', () => {
      expect(getAgents('chat_summary')).toBeDefined()
      expect(getAgents('user_info')).toBeDefined()
      expect(getAgents('long_memory')).toBeDefined()
      expect(getAgents('title_generator')).toBeDefined()
    })

    it('returns different agent instances for different ids', () => {
      expect(getAgents('chat_summary')).not.toBe(getAgents('user_info'))
    })

    it('still returns undefined for an unknown id', () => {
      expect(getAgents('unknown_agent' as any)).toBeUndefined()
    })
  })
})
