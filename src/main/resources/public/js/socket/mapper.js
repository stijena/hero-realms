// MAPPER.js interprets messages that arrive from BE via WebSocket.

/**
 * Method that maps message from BE to appropriate set of actions.
 * 
 * @param msg message that arrived from BE
 */
function mapMessage(msg) {

    var backendJSON = JSON.parse(msg.data)

    if (backendJSON.error) {
        alert(backendJSON.error);
        return;
    }

    if (jQuery.isEmptyObject(board)) {
        board = backendJSON;
        initBoard();
    } else {
        var browserPlayerName = user.username;
        var oldCurrentPlayerName = board.currentPlayer.username;
        var newCurrentPlayerName = backendJSON.currentPlayer.username;

        if (oldCurrentPlayerName != newCurrentPlayerName) {
            // Turn changed
            changeTurnField(browserPlayerName, newCurrentPlayerName);
            newTurnUpdate(backendJSON, browserPlayerName == newCurrentPlayerName);         
        } else {
            checkForChanges(backendJSON, browserPlayerName == newCurrentPlayerName);            
        }
        
        // Old board is overwritten with the new board
        board = backendJSON;
/*         if (user.username == backendJSON.currentPlayer.username) {
            // SAME PLAYER, SAME TURN
        } else {
            // DIFFERENT PLAYER, NEW TURN
        } */
    }

}
/**
 * Update the board when the player ended his turn.
 */
function newTurnUpdate(newBoardState, isPlayerTurn) {

    // PLAYER BOARD SIDE
    var boardPlayerOld = board.player;
    var boardPlayerNew = newBoardState.player;    

    if (!isPlayerTurn) {
        discardHand(boardPlayerOld.hand);
        discardNonPermanent(boardPlayerOld.nonpermanent, 1900);
        drawHand(boardPlayerNew.hand);
        resetTokens("player", boardPlayerNew);
    } else {
        resetTokens("opponent", boardPlayerNew);
    }

}

/**
 * Method that checks for changes between old board state and new board state and propagate in on FE.
 * 
 * @param newBoardState new state of the board that arrived as JSON over WebSocket
 * @param isPlayerTurn value is true if player that controls the browser also holds the current turn
 */
function checkForChanges(newBoardState, isPlayerTurn) {

    // PLAYER BOARD SIDE
    var boardPlayerOld = board.player;
    var boardPlayerNew = newBoardState.player;

    var playerHandOld = boardPlayerOld.hand;
    var playerHandNew = boardPlayerNew.hand; 
    for (var i = 0; i < playerHandOld.length; i++) {
        var handCardId = playerHandOld[i].id;
        var handCardFound = playerHandNew.find(function(card) { return card.id === handCardId});
        if (!handCardFound) { 
            // TODO provjeri nalazi li se na boardu
            playCard(handCardId, cards[playerHandOld[i].code].type);
        }
    }

    var playerPermanentOld = boardPlayerOld.permanent;
    var playerPermanentNew = boardPlayerNew.permanent;
    for (var i = 0; i < playerPermanentOld.length; i++) {
        var permanentCardId = playerPermanentOld[i].id;
        var permanentCardFound = playerPermanentNew.find(function(card) { return card.id === permanentCardId});
        if (!permanentCardFound) { 
            // disposeCard(permanentCardId)
        }
    }

    // TODO same for permanent as for non permanent

    if (boardPlayerOld.health !== boardPlayerNew.health) update("player", "health", boardPlayerNew.health);
    if (boardPlayerOld.combat !== boardPlayerNew.combat) update("player", "combat", boardPlayerNew.combat);
    if (boardPlayerOld.gold !== boardPlayerNew.gold) update("player", "gold", boardPlayerNew.gold);    
    if (boardPlayerOld.deck !== boardPlayerNew.deck) updateDeckCardsLeft("player", boardPlayerNew.deck);

    // MARKET BOARD SIDE 
    for (var i = 0; i < board.market.length; i++) {
        var newMarket = newBoardState.market;
        if (board.market[i].id != newMarket[i].id) {
            acquire(i, board.market[i], newMarket[i], isPlayerTurn);
        }
    }

    // OPPONENT BOARD SIDE
    var boardOpponentOld = board.opponent;
    var boardOpponentNew = newBoardState.opponent;

    if (boardOpponentOld.health !== boardOpponentNew.health) update("opponent", "health", boardOpponentNew.health);
    if (boardOpponentOld.combat !== boardOpponentNew.combat) update("opponent", "combat", boardOpponentNew.combat);
    if (boardOpponentOld.gold !== boardOpponentNew.gold) update("opponent", "gold", boardOpponentNew.gold);
    if (boardOpponentOld.deck !== boardOpponentNew.deck) updateDeckCardsLeft("opponent", boardOpponentNew.deck);    

    for (i = 0; i < board.opponent.permanent.length; i++) {
        var newOpponentPermanent = newBoardState.permanent;
    } 



    board = newBoardState;
}