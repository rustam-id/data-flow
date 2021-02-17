#!/bin/bash
echo "Удаление существующих образа и контейнера";
docker stop data_flow;
docker rm data_flow;
docker rmi data_flow_img:v1;
echo "Начало процесса установки";
echo "Устанавливаем образ  сервиса"; 
docker build -t data_flow_img:v1 .;
echo "Запускаем контейнер";
docker run -p 3005:3005  -d  --name data_flow data_flow_img:v1;