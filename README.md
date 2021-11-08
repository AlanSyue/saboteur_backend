# Saboteur

## Demo
https://game.dev.newideas.com.tw/

## Description
This is an online board game that can play with your friends!

This repository implements APIs and the websocket service.

You can see the frontend repository [here](https://github.com/sallylin831006/Saboteur).

You can see the game's rule [here](https://www.ultraboardgames.com/saboteur/game-rules.php).
![image](https://user-images.githubusercontent.com/33183531/137562850-add83a9e-b7d3-4f5a-ac8c-40a02cbbf28f.png)


## Tools

- **docker and docker-compose**: https://www.docker.com/products/docker-desktop

## Getting Started

1. Create and turn on the development environment
```
  docker-compose up -d
```
2. Test the API
  [http://localhost:8000/](http://localhost:8000/)
  
## Some useful commands

- Enter the node environemnt. (If you want to install any node module, please enter first.)
```
  docker-compose run app /bin/bash
```

- Show web service logs
```
  docker-compose logs -f app
```

- Turn off the environment
```
  docker-compose down
```

- Run the tests
```
  docker-compose run node npm run test
```
