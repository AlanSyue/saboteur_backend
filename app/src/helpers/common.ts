/**
 * @var number
 */
export const TOTAL_CARDS_NUMBER = 67;

/**
 * The team of the good saboteur.
 * 
 * @var string
 */
export const TEAM_GOOD_SABOTEUR = '1';

/**
 * The team of the bad saboteur.
 * 
 * @var string
 */
export const TEAM_BAD_SABOTEUR = '2';

/**
 * The tool card IDs.
 * 
 * @var array
 */
export const TOOL_CARD_IDS = [
    47,
    48,
    49,
    50,
    51,
    52,
    53,
    54,
    55,
    56,
    57,
    58,
    59,
    60,
    61,
    62,
    63,
    64,
    65,
    66,
    67,
];

/**
 * The interface of the game's setting.
 * 
 * @var interface
 */
export interface gameSettingInterface {
    [maxPlayerNumber: string]: settingConfigInterface
};

/**
 * The interface of the game's setting config.
 * 
 * @var interface
 */
export interface settingConfigInterface {
    team: {
        [TEAM_GOOD_SABOTEUR]: number,
        [TEAM_BAD_SABOTEUR]: number,
    },
    cardsNumber: number,
    goldCardNumber: number,
}

/**
 * The game's setting.
 * 
 * @var gameSettingInterface
 */
export const GAME_SETTING: gameSettingInterface = {
    "3": {
        team: {
            [TEAM_GOOD_SABOTEUR]: 2,
            [TEAM_BAD_SABOTEUR]: 1,
        },
        cardsNumber: 6,
        goldCardNumber: 3,

    },
    "4": {
        team: {
            [TEAM_GOOD_SABOTEUR]: 3,
            [TEAM_BAD_SABOTEUR]: 1,
        },
        cardsNumber: 6,
        goldCardNumber: 4,

    },
    "5": {
        team: {
            [TEAM_GOOD_SABOTEUR]: 4,
            [TEAM_BAD_SABOTEUR]: 2,
        },
        cardsNumber: 6,
        goldCardNumber: 5,

    },
    "6": {
        team: {
            [TEAM_GOOD_SABOTEUR]: 5,
            [TEAM_BAD_SABOTEUR]: 2,
        },
        cardsNumber: 5,
        goldCardNumber: 6,

    },
    "7": {
        team: {
            [TEAM_GOOD_SABOTEUR]: 5,
            [TEAM_BAD_SABOTEUR]: 3,
        },
        cardsNumber: 5,
        goldCardNumber: 7,

    },
    "8": {
        team: {
            [TEAM_GOOD_SABOTEUR]: 6,
            [TEAM_BAD_SABOTEUR]: 3,
        },
        cardsNumber: 4,
        goldCardNumber: 8,

    },
    "9": {
        team: {
            [TEAM_GOOD_SABOTEUR]: 7,
            [TEAM_BAD_SABOTEUR]: 3,
        },
        cardsNumber: 4,
        goldCardNumber: 9,

    },
    "10": {
        team: {
            [TEAM_GOOD_SABOTEUR]: 7,
            [TEAM_BAD_SABOTEUR]: 4,
        },
        cardsNumber: 4,
        goldCardNumber: 9,

    },
}

/**
 * @returns number[]
 */
export const generateCards = (): number[] => {
    let cards: number[] = [];

    for (let index: number = 1; index <= TOTAL_CARDS_NUMBER; index++) {
        cards.push(index);
    }

    return cards;
}
/**
 * @param  {number} goodSaboteurNumber
 * @param  {number} badSaboteurNumber
 * @returns string
 */
export const generateTeams = (goodSaboteurNumber: number, badSaboteurNumber: number): string[] => {
    let teams: string[] = [];

    for (let index = 0; index < goodSaboteurNumber; index++) {
        teams.push(TEAM_GOOD_SABOTEUR);
    }

    for (let index = 0; index < badSaboteurNumber; index++) {
        teams.push(TEAM_BAD_SABOTEUR);
    }

    return teams;
}

/**
 * @param  {any[]} array
 * @returns any
 */
export const shuffleArray = (array: any[]): any[] => {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}
