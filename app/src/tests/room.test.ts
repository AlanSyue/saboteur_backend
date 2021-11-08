import { getNextPlayer } from '../route/rooms/rooms.controller';

describe('test get next player', () => {
  test('test all players have cards', async () => {
    const players = {
      alan: {
        next_player: 'sally',
        cards: [1],
      },
      sally: {
        next_player: 'ken',
        cards: [1],
      },
      ken: {
        next_player: 'giny',
        cards: [1],
      },
      giny: {
        next_player: 'alan',
        cards: [1],
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
      },
      sally: {
        next_player: 'giny',
        cards: [],
      },
      giny: {
        next_player: 'alan',
        cards: [],
      },
    }
    const nextPlayer = await getNextPlayer('alan', players);
    expect(nextPlayer).toEqual('NO_ONE_CAN_MOVE');
  })
})
