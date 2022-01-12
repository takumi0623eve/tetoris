//落ちるスピード
const GAME_SPEED = 300; //1000ms = 1s

//フィールドサイズ
const FIELD_COL = 10;
const FIELD_ROW = 20;

//ブロックひとつのサイズ
const BLOCK_SIZE = 30;

//キャンバスサイズ
const SCREEN_W = BLOCK_SIZE * FIELD_COL; //300
const SCREEN_H = BLOCK_SIZE * FIELD_ROW; //600

//テトロミノのサイズ
const TETORO_SIZE = 4; //4×4

let can = document.getElementById("can");
let con = can.getContext("2d"); //描画するために必要+

//キャンバスにサイズ代入
can.width = SCREEN_W;
can.height = SCREEN_H;
can.style.border = "4px solid #555"; //キャンバスの枠

//テトリスのカラー
const TETRO_COLORS =[
    "#000", //0 空
    "#6CF", //1 水色
    "#F92", //2 オレンジ
    "#66F", //3 青
    "#C5C", //4 紫
    "#FD2", //5 黄色
    "#F44", //6 赤
    "#5B5", //7 緑
];

//テトロミノの形が宣言されている配列(0,1で表現)
const TETRO_TYPES = [
    [], //0: 空っぽ

    [ //1: I
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    [ //2: L
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
    ],
    [ //3: J
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
    ],
    [ //4: T
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
    ],
    [ //5: O
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
    ],
    [ //6: Z
        [0, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
    ],
    [ //7: S
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
    ]
];

//最初に真ん中に描画されるようにする
const START_X = FIELD_COL / 2/*フィールドの半分 */ - TETORO_SIZE /2/*テトロミノの半分 */; //真ん中の座標
const START_Y = 0;

//テトロミノの本体
let tetro;

//テトロミノの初期座標
let tetro_x = START_X;
let tetro_y = START_Y;

//テトロミノの形指定
let tetro_t;

//フィールド本体
let field = [];

//ゲームオーバーフラグ
let over = false;

//消したライン数
let lines = 0;

//形の描画のランダム化
function random_t(){
    tetro_t = Math.floor(Math.random() * (TETRO_TYPES.length /*配列の大きさ */ - 1)) + 1;
    tetro = TETRO_TYPES[tetro_t];
}

//初期呼び出し
init();
random_t();
drawAll();

//一定間隔ごとに呼び出される
setInterval(dropTetro, GAME_SPEED/*ミリ秒*/);

//フィールド本体の初期化(10*20)
function init() {
    for (let y = 0; y < FIELD_ROW; y++) {
        field[y] = []; //二次元配列化
        for (let x = 0; x < FIELD_COL; x++) {
            field[y][x] = 0;
        }
    }
    //fieldのテスト表示
    field[5][8] = 1;
    field[19][0] = 1;
    field[19][9] = 1;
}

//ブロック一つの描画
function drawBlock(x, y, c){
    let px = x * BLOCK_SIZE; //BLOCK_SIZEの分だけx増加
    let py = y * BLOCK_SIZE; //BLOCK_SIZEの分だけy増加

    con.fillStyle = TETRO_COLORS[c]; //塗りつぶしの色
    con.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE); //座標とサイズ指定
    con.strokeStyle = "black"; //枠の色
    con.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE); //座標とサイズ指定
}

//全部の描画(フィールド + テトロミノ)
function drawAll() {
    //フィールド表示
    con.clearRect(0, 0, SCREEN_W, SCREEN_H); //画面のクリア(消去):継続的に表示させないため
    for (let y = 0; y < FIELD_ROW; y++) { //フィールドの縦幅まで
        for (let x = 0; x < FIELD_COL; x++) { //フィールドの横幅まで
            if (field[y][x]) {
                drawBlock(x, y, field[y][x]);
            }
        }
    }
    //テトロミノの表示
    for (let y = 0; y < TETORO_SIZE; y++) {
        for (let x = 0; x < TETORO_SIZE; x++) {
            if (tetro[y][x]) {
                drawBlock(tetro_x + x, tetro_y + y, tetro_t);
            }
        }
    }
    if (over){
        let s = "GAME OVER";
        con.font ="40px 'MSゴシック'";
        let w = con.measureText(s).width; //文字の長さを図る
        let x = SCREEN_W/2 - w / 2;
        let y = SCREEN_H / 2 - 20;
        con.lineWidth = 4;
        con.strokeText(s, x, y);
        con.fillStyle = "white";
        con.fillText(s, x, y);
    }
}

//あたり判定(指定先に行けるかどうか)
/*テトロミノ(ブロック)がフィールド上にあるか全て判断 */
function checkMove(mx, my, new_tetro){
    if(new_tetro === undefined) new_tetro = tetro; //引数のnew_tetroがないならそのまま代入
    for (let y = 0; y < TETORO_SIZE; y++) {
        for (let x = 0; x < TETORO_SIZE; x++) {
            //指定先の座標
            let new_x = tetro_x + mx + x;
            let new_y = tetro_y + my + y;

            if(new_tetro[y][x]){
                if ((new_y < 0 || new_x < 0) ||
                (new_y >= FIELD_ROW || new_x >= FIELD_COL)) return false; //範囲チェック
                if (field[new_y][new_x]) return false; //物体があるならfalse
            }
        }
    }

    return true; //問題がなければtrue
}

//テトロの回転したときの関数
function rotate(){
    let new_tetro = [];

    for (let y = 0; y < TETORO_SIZE; y++) {
        new_tetro[y] = [];
        for (let x = 0; x < TETORO_SIZE; x++) {
            //new_tetro[y][x] = tetro[y][x]; でtetroのそのままコピー
            //90度右に傾けたテトロミノが代入される
            new_tetro[y][x] = tetro[(TETORO_SIZE -1) - x][y];
        }
    }

    return new_tetro;
}


//落ちたブロックの固定
function fixTetro(){
    for (let y = 0; y < TETORO_SIZE; y++) {
        for (let x = 0; x < TETORO_SIZE; x++) {
            if(tetro[y][x]){
                field[tetro_y + y][tetro_x + x] = tetro_t; //現在地を全て1にする
            }
        }
    }
}

//ラインがそろったらチェックして消す
function checkLine(){
    let linecnt =0;
    for (let y = 0; y < FIELD_ROW; y++) {

        let flag = true;

        for (let x = 0; x < FIELD_COL; x++) {
            if (!field[y][x]) { //何も入ってなかったら
                flag = false; //そろってないのでfalse
                break;
            }
        }

        //全部そろっている時だけ
        if(flag){
            linecnt++;

            for(let new_y = y; new_y > 0; new_y--){
                for (let new_x = 0; new_x < FIELD_COL; new_x++) {
                    //上の段から持ってくる
                    field[new_y][new_x] = field[new_y -1][new_x];
                }
            }
        }
    }
}

//一定間隔で落ちるようにする
function dropTetro(){
    if (over) return;

    if (checkMove(0, 1) /*行きたいところの座標*/ ) {
        tetro_y++;
    }else { //落ちれなくなったら(下まで落ちたら)
        //ブロックの固定
        fixTetro();

        checkLine();

        random_t();

        //新しいテトロミノのために初期化
        tetro_x = START_X;
        tetro_y = START_Y;

        //初期値で置けなくなったら
        if(!checkMove(0, 0)){
            over =true;
        }
    }

    //更新されたので描画しなおし
    drawAll();
}

document.onkeydown = function(e){ //キーボードが押されたときに関数呼び出し
    if (over) return;

    //onkeydown keycode 検索
    switch(e.keyCode){ //押されたキーごとでケースを変える
        case 37: //左
        if(checkMove(-1 , 0)/*行きたいところの座標*/) tetro_x--;
            break;
        case 38: //上
        if (checkMove(0, -1) /*行きたいところの座標*/ ) tetro_y--;
        break;
        case 39: //右
        if (checkMove(1, 0) /*行きたいところの座標*/ ) tetro_x++;
            break;
        case 40: //下
        if (checkMove(0, 1) /*行きたいところの座標*/ ) tetro_y++;
            break;
        case 32: //スペースキー
        let new_tetro = rotate();
        if(checkMove(0, 0, new_tetro) /* 今の座標*/ ) tetro = new_tetro;
            break;
    }
    //キーが押されたら繰り返し呼び出し
    drawAll();
}