#!/bin/bash
cd /home/kavia/workspace/code-generation/tictac-ai-play-95410-42c7d251/tic_tac_toe_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

