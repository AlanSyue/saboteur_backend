import { getNextPlayer } from '../route/rooms/rooms.controller';

describe('test get next player', () => {
  test('test all players have cards', async () => {
    const players = {
      alan: {
        next_player: 'sally',
        cards: [1],
        is_ready: true,
      },
      sally: {
        next_player: 'ken',
        cards: [1],
        is_ready: true,
      },
      ken: {
        next_player: 'giny',
        cards: [1],
        is_ready: true,
      },
      giny: {
        next_player: 'alan',
        cards: [1],
        is_ready: true,
      },
    }
    const nextPlayer = await getNextPlayer('alan', players);
    expect(nextPlayer).toEqual('sally');
  })

  test('test all players do not have cards', async () => {
    const players = {
      alan: {
        next_player: 'sally',
        cards: [],
        is_ready: true,
      },
      sally: {
        next_player: 'giny',
        cards: [],
        is_ready: true,
      },
      giny: {
        next_player: 'alan',
        cards: [],
        is_ready: true,
      },
    }
    const nextPlayer = await getNextPlayer('alan', players);
    expect(nextPlayer).toEqual('NO_ONE_CAN_MOVE');
  })
})
