const mysql = require('mysql2/promise');
require('dotenv').config();

const mysqlConfig = {
    connectionLimit: 20,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
};

const DB = {};
DB.conn = mysql.createPool(mysqlConfig);

// Home
// #-추천갤러리
DB.getHomeGalleryList = async () => {
    var sql =
        'SELECT a.au_code, b.nft_author, b.nft_name, b.nft_description, b.nft_external_url, b.nft_hash FROM tb_gallery a JOIN tb_ipfs b  ON a.au_code = b.nft_author_code LIMIT 0, 3';
    const [rows] = await DB.conn.query(sql);
    return rows;
};
DB.getHomeGalleryAuthor = async () => {
    var sql =
        'SELECT b.nft_author AS nft_author FROM tb_gallery a JOIN tb_ipfs b  ON a.au_code = b.nft_author_code LIMIT 0, 1';
    const [rows] = await DB.conn.query(sql);
    return rows[0];
};
// #-판매랭킹
DB.getHomeTopSaleList = async () => {
    var sql =
        "SELECT a.sell_addr, b.nft_external_url, b.nft_name, b.nft_hash, c.seq, c.uimg, SUM(a.price_krw / (SELECT coin_krw FROM tb_exchange WHERE symbol ='BMIC')) AS total_bmic FROM vw_market a JOIN vw_nft b  ON a.token_id = b.token_id JOIN tb_user c  ON a.sell_seq = c.seq WHERE a.sell_status ='S' GROUP BY c.seq ORDER BY total_bmic DESC LIMIT 0, 5";
    const [rows] = await DB.conn.query(sql);
    return rows;
};
// #-인기순NFT
DB.getHomeTopNftList = async () => {
    var sql =
        'SELECT nft_external_url, nft_name, nft_hash, like_cnt  FROM vw_nft ORDER BY like_cnt DESC LIMIT 0, 5';
    const [rows] = await DB.conn.query(sql);
    return rows;
};
// #-24시간 옥션
DB.getHomeAuction = async () => {
    var sql =
        "SELECT a.seq, a.sell_seq, a.token_id, a.txid, a.sell_addr, a.sell_type, a.money_type, a.start_bnb, a.start_bmic, a.start_money, a.curr_bnb, a.curr_bmic, a.curr_money, a.sell_bnb, a.sell_bmic, a.sell_money, a.start_dttm, a.end_dttm, a.bid_cnt, a.last_bid_user_seq, last_bid_addr, a.buy_user_seq, a.buy_addr, a.sell_status, a.sell_dttm, a.ins_dttm, b.nft_external_url, b.nft_name, b.nft_hash, c.uimg, c.unick, DATE_FORMAT(a.end_dttm, '%Y-%m-%d') = CURDATE() as live FROM tb_market a JOIN vw_nft b  ON a.token_id = b.token_id JOIN tb_user c ON a.sell_seq = c.seq WHERE a.sell_type = 'A' AND a.sell_status ='N' AND DATE_FORMAT(a.end_dttm, '%Y-%m-%d') = CURDATE() ORDER BY a.end_dttm ASC LIMIT 0, 5";
    const [rows] = await DB.conn.query(sql);
    return rows;
};
// #-등록된순
DB.getHomeNewNft = async () => {
    var sql =
        "SELECT a.seq, a.sell_seq, a.token_id, a.txid, a.sell_addr, a.sell_type, a.money_type, a.start_bnb, a.start_bmic, a.start_money, a.curr_bnb, a.curr_bmic, a.curr_money, a.sell_bnb, a.sell_bmic, a.sell_money, a.start_dttm, a.end_dttm, a.bid_cnt, a.last_bid_user_seq, a.last_bid_addr, a.buy_user_seq, a.buy_addr, a.sell_status, a.sell_dttm, a.ins_dttm , b.nft_external_url, b.nft_name, b.nft_hash, c.uimg, c.unick FROM tb_market a JOIN vw_nft b ON a.token_id = b.token_id JOIN tb_user c ON a.sell_seq = c.seq WHERE a.sell_status ='N' AND a.end_dttm > NOW() ORDER BY a.seq DESC LIMIT 0, 5";
    const [rows] = await DB.conn.query(sql);
    return rows;
};

DB.getAuthor = async () => {
    var sql = 'SELECT au_name FROM tb_author';
    const [rows] = await DB.conn.query(sql);
    return rows;
};

// # - NFT 상세페이지
DB.getNftDetail = async ({ id }) => {
    var sql =
        'SELECT a.token_id, a.first_owner, a.nft_hash, a.image_hash, a.nft_figure, a.nft_category, a.nft_name, a.nft_description, a.nft_attributes, a.nft_image, a.nft_external_url, a.au_code, a.au_name, a.au_phone, a.au_description, a.au_img, a.ins_dttm, c.unick, c.wallet_addr FROM vw_nft a JOIN vw_market b  ON a.token_id = b.token_id JOIN tb_user c ON b.sell_seq = c.seq WHERE a.nft_hash = ?';
    const [rows] = await DB.conn.query(sql, [id]);
    return rows[0];
};

// # - 작가의 다른 작품
DB.getAuNft = async ({ au_code }) => {
    var sql =
        'SELECT token_id, first_owner, nft_hash, image_hash, nft_category, nft_name, nft_description, nft_attributes, nft_image, nft_external_url, au_code, au_name, au_phone, au_description, au_img, ins_dttm FROM vw_nft WHERE au_code = ? LIMIT 0, 5';
    var params = [au_code];
    const [rows] = await DB.conn.query(sql, params);
    return rows;
};

DB.getNftMarket = async ({ token_id }) => {
    var sql =
        "SELECT a.seq, a.sell_seq, a.token_id, a.txid, a.sell_addr, a.sell_type, a.money_type, a.start_bnb, a.start_bmic, a.start_money, a.curr_bnb, a.curr_bmic, a.curr_money, a.sell_bnb, a.sell_bmic, a.sell_money, a.start_dttm, a.end_dttm, a.bid_cnt, a.last_bid_user_seq, a.last_bid_addr, a.buy_user_seq, a.buy_addr, a.sell_status, a.sell_dttm, a.ins_dttm, b.uimg FROM tb_market a JOIN tb_user b ON a.sell_seq = b.seq WHERE a.token_id = ? AND a.sell_status = 'N'";
    var params = [token_id];
    const [rows] = await DB.conn.query(sql, params);
    return rows[0];
};

DB.getNftBid = async ({ seq }) => {
    var sql =
        "SELECT a.seq, a.mk_seq, a.user_seq, a.amount_bnb, a.amount_bmic, a.txid, a.bid_addr, a.token_id, a.bid_status, DATE_FORMAT(a.bid_dttm, '%Y-%m-%d') AS bidDttm, a.bid_dttm,  a.upt_dttm, b.uid, b.unick, b.uimg FROM tb_market_bid a JOIN tb_user b ON a.user_seq = b.seq WHERE a.mk_seq = ?";
    var params = [seq];
    const [rows] = await DB.conn.query(sql, params);
    return rows;
};

DB.getNftEventList = async ({ token_id }) => {
    var sql =
        'SELECT token_id, txid, method, blocknumber, from_addr, to_addr, amount, inputs, tokenuri, toaddress, price, minvalue, auctiontime, ttime, created_at, price_type FROM tb_nft_history  WHERE token_id = ? ORDER BY ttime DESC';
    var params = [token_id];
    const [rows] = await DB.conn.query(sql, params);
    return rows;
};

DB.getGalleryCnt = async ({ tab }) => {
    var sql = 'SELECT COUNT(*) as cnt FROM tb_ipfs WHERE nft_author = ?';

    var params = [tab];
    const [rows] = await DB.conn.query(sql, params);
    return rows[0];
};

DB.getGalleyList = async ({ tab, limit, offset, pageParam }) => {
    var sql =
        'SELECT nft_author, nft_name, nft_description, nft_external_url, nft_hash FROM tb_ipfs  WHERE nft_author = ?';

    if (limit && pageParam > -1) {
        sql = sql + ' LIMIT ' + limit + ' OFFSET ' + offset;
    }

    var params = [tab];

    const [rows] = await DB.conn.query(sql, params);
    return rows;
};

// # - marketList
DB.getMarketList = async ({
    search,
    sell_status,
    category,
    sale,
    priceStart,
    priceEnd,
    sort,
    limit,
    pageParam,
    offset,
    user_seq,
    my_user_seq,
    except_mk_seq,
}) => {
    console.log('getMarketList ------------------------------  start');

    // STB_EXCHANGE 테이블에서 SALE_FEE 가져와서 a.curr_ceth 계산을 하여 새로 보내줘야 함을 추가해야함
    var sql_fee = `
        SELECT
            sale_fee
        FROM
            stb_exchange
        WHERE
            symbol = 'CETH';
        `;
    const [rows_fee] = await DB.conn.query(sql_fee);

    // rows_fee[0].sale_fee를 float로 변환하여 sale_fee에 저장
    var sale_fee = parseFloat(rows_fee[0].sale_fee);

    // sql쿼리에 price(= a_curr_ceth + (a_curr_ceth * sale_fee)) 항목을 추가로 넣어준다.
    var sql =
        `SELECT 
            a.seq, a.user_seq, a.token_id, a.contract, a.mtype, a.sell_addr, a.sell_type, a.sell_period, a.category, 
            a.description, a.start_ceth, a.curr_ceth, a.start_dttm, a.end_dttm, a.buy_user_seq, a.buy_addr, a.sell_status, 
            a.sell_dttm, a.ins_dttm, a.upt_dttm, b.img_src, b.nft_name, b.like_cnt,            
            (CASE WHEN c.user_seq IS NULL THEN 0 ELSE 1 END) AS is_liked,
            (a.curr_ceth + (a.curr_ceth * ${sale_fee})) AS price
        FROM 
            mtb_market a 
        LEFT JOIN 
            mtb_nft b ON a.token_id = b.token_id AND a.contract = b.contract 
        LEFT JOIN           
           mtb_market_like c ON a.seq = c.mk_seq AND c.user_seq = ?
        WHERE `;

    let params = [my_user_seq];

    console.log('프론트가 보낸 sell_status : ', sell_status);

    if (sell_status !== undefined && sell_status != '' && sell_status !== 'undefined') {
        sql += " a.sell_status = ?";
        params.push(sell_status);
        console.log('sell_status : ', sell_status);
        console.log('쿼리에 사용되는 sell_status : ', sell_status);
    } else {
        sql += " a.sell_status = 'N'";
        console.log('sell_status : N');
        console.log('쿼리에 사용되는 sell_status : N');
    }

    if (user_seq !== null && user_seq !== 'null') {
        sql += " AND a.user_seq = ?";
        params.push(user_seq);
        console.log('user_seq : ', user_seq);
    }

    if (except_mk_seq !== null && except_mk_seq !== 'null') {
        sql += " AND a.seq <> ?";
        params.push(except_mk_seq);
        console.log('except_mk_seq : ', except_mk_seq);
    }

    if (search != '') {
        sql += " AND (b.nft_name LIKE ? OR b.description LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
        console.log('search : ', search);
    }

    if (category != '') {
        let cg = Array.isArray(category) ? category.join(',') : category;
        sql += " AND a.category IN (?)";
        params.push(cg);
        // console.log('category : ', cg);
    }

    // org
    // if (priceStart && priceEnd && priceStart != 0 && priceEnd != 0) {
    //     sql += " AND a.curr_ceth >= ? AND a.curr_ceth <= ?";
    //     params.push(priceStart, priceEnd);
    //     console.log('priceStart, priceEnd : ', priceStart, priceEnd);
    // }

    // if (priceStart && priceEnd && priceStart > -1 && priceEnd > -1) {
    if (priceStart && priceEnd && priceStart < priceEnd) {
        sql += " AND (a.curr_ceth + (a.curr_ceth * ?)) >= ? AND (a.curr_ceth + (a.curr_ceth * ?)) <= ?";
        params.push(sale_fee, priceStart, sale_fee, priceEnd);
        console.log('priceStart, priceEnd : ', priceStart, priceEnd);
    }

    if (sort == 'new') {
        // sql = sql + ' ORDER BY a.ins_dttm DESC';
        sql = sql + ' ORDER BY a.start_dttm DESC';
    } else if (sort == 'like') {
        sql = sql + ' ORDER BY b.like_cnt DESC';
    } else if (sort == 'end') {
        // 경매
        if (sale != 'auction') {
            sql = sql + " AND a.sell_type = 'A'";
        }
        sql = sql + ' ORDER BY a.end_dttm ASC';
    } else if (sort == 'low') {
        // 경매
        sql = sql + ' ORDER BY a.curr_ceth ASC';
    } else if (sort == 'high') {
        // 경매
        sql = sql + ' ORDER BY a.curr_ceth DESC';
    }

    if (limit && pageParam > -1) {
        sql = sql + ' LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset)); // Convert limit and offset to numbers
    }

    console.log('sql', sql)
    const [rows] = await DB.conn.query(sql, params);
    return rows;
};

DB.getMarketCnt = async ({
    search,
    sell_status,
    category,
    priceStart,
    priceEnd,
    user_seq,
    except_mk_seq,
}) => {
    // STB_EXCHANGE 테이블에서 SALE_FEE 가져와서 a.curr_ceth 계산을 하여 새로 보내줘야 함을 추가해야함
    var sql_fee = `
        SELECT
            sale_fee
        FROM
            stb_exchange
        WHERE
            symbol = 'CETH';
        `;
    const [rows_fee] = await DB.conn.query(sql_fee);

    // rows_fee[0].sale_fee를 float로 변환하여 sale_fee에 저장
    var sale_fee = parseFloat(rows_fee[0].sale_fee);

    var sql = `
        SELECT 
            COUNT(*) AS cnt  
        FROM 
            mtb_market a LEFT JOIN mtb_nft b ON a.token_id = b.token_id AND a.contract = b.contract
        WHERE `;

    let params = [];

    if (sell_status !== undefined && sell_status != '') {
        sql += " a.sell_status = ?";
        params.push(sell_status);
        console.log('sell_status : ', sell_status);
    } else {
        sql += " a.sell_status = 'N'";
        console.log('sell_status : N');
    }

    if (user_seq !== null && user_seq !== 'null') {
        sql += " AND a.user_seq = ?";
        params.push(user_seq);
        console.log('user_seq : ', user_seq);
    }

    if (except_mk_seq !== null && except_mk_seq !== 'null') {
        sql += " AND a.seq <> ?";
        params.push(except_mk_seq);
        console.log('except_mk_seq : ', except_mk_seq);
    }

    if (search != '') {
        sql += " AND (b.nft_name LIKE ? OR b.description LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
        console.log('search : ', search);
    }

    if (category != '') {
        let cg = Array.isArray(category) ? category.join(',') : category;
        sql += " AND a.category IN (?)";
        params.push(cg);
        console.log('category : ', cg);
    }

    // org
    // if (priceStart && priceEnd && priceStart != 0 && priceEnd != 0) {
    //     sql += " AND a.curr_ceth >= ? AND a.curr_ceth <= ?";
    //     params.push(priceStart, priceEnd);
    //     console.log('priceStart, priceEnd : ', priceStart, priceEnd);
    // }

    if (priceStart && priceEnd && priceStart < priceEnd) {
        sql += " AND (a.curr_ceth + (a.curr_ceth * ?)) >= ? AND (a.curr_ceth + (a.curr_ceth * ?)) <= ?";
        params.push(sale_fee, priceStart, sale_fee, priceEnd);
        console.log('priceStart, priceEnd : ', priceStart, priceEnd);
    }

    const [rows] = await DB.conn.query(sql, params);
    return rows[0];
};

DB.getPriceHistory = async ({ token_id }) => {
    var sql =
        "SELECT token_id, price, price_type, ttime, DATE_FORMAT(FROM_UNIXTIME(ttime), '%Y-%m-%d') AS price_dttm FROM tb_nft_history WHERE method IN ('MINT', 'BUY', 'BUY_TOKEN', 'END_AUCTION') AND token_id = ? ORDER BY ttime ASC";
    var params = [token_id];
    const [rows] = await DB.conn.query(sql, params);
    return rows;
};

// # - 시세
DB.getPrice = async () => {
    var sql = 'SELECT symbol, coin_krw, coin_usdt FROM tb_exchange';
    const [rows] = await DB.conn.query(sql);
    return rows;
};

// #- 회원정보
DB.getUserData = async (values) => {
    var sql =
        "SELECT COUNT(*) AS cnt, ceth_balance, seq, unick, wallet_addr,  uimg, ulike, join_status, activation_code FROM mtb_user WHERE wallet_addr = ? AND join_status = 'S'";
    const [rows] = await DB.conn.query(sql, values);
    return rows[0];
};

// # - 회원가입
DB.setUserData = async ({ wallet_addr }) => {
    var sql =
        // "INSERT INTO mtb_user (wallet_addr, unick, ceth_balance, join_status, join_dttm) VALUES (?, SUBSTRING(?,1,8) ,10,'S', NOW())";
        "INSERT INTO mtb_user (wallet_addr, unick, ceth_balance, join_status, join_dttm) VALUES (?, SUBSTRING(?,1,8), 0, 'S', NOW())";

    var params = [wallet_addr, wallet_addr];

    const [rows] = await DB.conn.query(sql, params);
    return rows;
};

// #- txid로 스왑기록 검색
DB.getUserSwapDataByTXID = async (values) => {
    var sql =
        'SELECT COUNT(*) AS cnt, seq, user_seq, uid FROM tb_user_swap WHERE txid = ?';
    const [rows] = await DB.conn.query(sql, values);
    return rows[0];
};

// # - cETH 스왑
DB.setUsercETHBalance = async ({ value, seq }) => {
    var sql =
        'UPDATE tb_user SET ceth_balance = ceth_balance + ?  WHERE seq = ?';

    var params = [value, seq];

    const [rows] = await DB.conn.query(sql, params);
    return rows;
};

// # - tb_user_swap 에 기록
DB.setUserSwapData = async (values) => {
    var sql =
        'INSERT INTO tb_user_swap (user_seq, uid, from_symbol, from_amount, to_addr, to_symbol, to_amount, txid, ins_dttm) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())';

    var params = [
        values.user_seq,
        values.uid,
        values.from_symbol,
        values.from_amount,
        values.to_addr,
        values.to_symbol,
        values.to_amount,
        values.txid,
    ];

    const [rows] = await DB.conn.query(sql, params);
    return rows;
};

// # - tb_user_swap_transfer 에 기록
DB.setUserSwapTransferData = async (values) => {
    var sql =
        'INSERT INTO tb_user_swap_transfer (txid, symbol, chain_id, chain_name, from_addr, to_addr, amount, gasprice, gasamount, nonce, trand_dttm) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())';

    var params = [
        values.txid,
        values.to_symbol,
        values.chain_id,
        values.chain_name,
        values.from_addr,
        values.to_addr,
        values.to_amount,
        values.gasprice,
        values.gasamount,
        values.nonce,
    ];

    const [rows] = await DB.conn.query(sql, params);
    return rows;
};

DB.getNftMarketSellData = async ({ token_id, contract }) => {
    var sql =
        'SELECT COUNT(*) AS cnt, seq, user_seq, token_id, contract, curr_ceth, sell_addr, sell_status FROM mtb_market WHERE token_id = ? AND contract = ?';
    const [rows] = await DB.conn.query(sql, [token_id, contract]);
    return rows[0];
};

DB.setNftMarketSellData = async ({
    mtype,
    amount,
    date,
    category,
    description,
    nft,
    user,
    txid,
}) => {
    console.log(`User Seq: ${user?.seq}`);
    console.log(`NFT Token ID: ${nft?.tokenId}`);
    console.log(`NFT Contract Address: ${nft?.contract?.address}`);
    console.log(`Transaction ID: ${txid}`);
    console.log(`User Wallet Address: ${user?.wallet_addr}`);
    console.log(`N: 'N'`);
    console.log(`Date: ${date}`);
    console.log(`Category: ${category}`);
    console.log(`Description: ${description}`);
    console.log(`Amount: ${amount}`);
    console.log(`Amount (Duplicate): ${amount}`);
    console.log(`N: 'N'`);
    console.log(`Parsed Date: ${parseInt(date)}`);
    console.log(`Date: ${date}`);

    // var sql =
    //     'INSERT INTO mtb_market (user_seq, token_id, contract, txid, sell_addr, sell_type, sell_period, category, description, start_ceth, curr_ceth, sell_status, start_dttm, end_dttm, ins_dttm) VALUES (?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), NOW())';
    var sql = `
    INSERT INTO mtb_market 
        (user_seq, token_id, contract, txid, sell_addr, sell_type, sell_period, 
            category, description, start_ceth, curr_ceth, sell_status, start_dttm, end_dttm, ins_dttm) 
    VALUES (?, ?, ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), NOW())
    `;

    var sell_period = 0;
    if (date > 100) {
        sell_period = null;
    } else {
        sell_period = date;
    }

    var params = [
        user?.seq,
        nft?.tokenId,
        nft?.contract?.address,
        txid,
        user?.wallet_addr,
        'N',
        sell_period,
        category,
        description,
        amount,
        amount,
        'N',
        parseInt(date),
    ];

    const [rows] = await DB.conn.query(sql, params);
    return rows;
};

DB.setNftSellData = async ({ nft, user }) => {
    var sql =
        'INSERT INTO mtb_nft (token_id, contract, img_src, tokenuri, nft_name, description, token_type, creator, metadata, ins_dttm) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())';

    var params = [
        nft?.tokenId,
        nft?.contract?.address,
        nft?.image?.originalUrl,
        nft?.tokenUri,
        nft?.name,
        nft?.description,
        nft?.tokenType,
        user?.wallet_addr,
        JSON.stringify(nft?.raw),
    ];

    const [rows] = await DB.conn.query(sql, params);
    return rows;
};

DB.getMyNftsList = async ({ user_seq, limit, offset }) => {
    // var sql =
    //     'SELECT seq, user_seq, token_id, contract, sell_status FROM mtb_market WHERE user_seq = ? LIMIT ?, ?';
    var sql =
        'SELECT seq, user_seq, token_id, contract, sell_status FROM mtb_market WHERE user_seq = ?';
    const [rows] = await DB.conn.query(sql, [user_seq]);
    return rows;
};


DB.getRecommNftsList = async () => {
    // STB_EXCHANGE 테이블에서 SALE_FEE 가져와서 a.curr_ceth 계산을 하여 새로 보내줘야 함을 추가해야함
    var sql_fee = `
        SELECT
            sale_fee
        FROM
            stb_exchange
        WHERE
            symbol = 'CETH';
        `;
    const [rows_fee] = await DB.conn.query(sql_fee);

    // rows_fee[0].sale_fee를 float로 변환하여 sale_fee에 저장
    var sale_fee = parseFloat(rows_fee[0].sale_fee);

    // var sql =
    //     'SELECT a.seq, a.user_seq, a.token_id, a.contract, a.sell_status, b.img_src, b.nft_name, a.curr_ceth FROM mtb_market a LEFT JOIN mtb_nft b ON a.token_id = b.token_id AND a.contract = b.contract WHERE a.sell_status = "N" LIMIT 0, 10 ';
    var sql = `
        SELECT 
            a.seq, a.user_seq, a.token_id, a.contract, a.sell_status, b.img_src, b.nft_name, a.curr_ceth,
            (a.curr_ceth + (a.curr_ceth * ${sale_fee})) AS price
        FROM 
            mtb_market a 
            LEFT JOIN mtb_nft b ON a.token_id = b.token_id AND a.contract = b.contract 
        WHERE a.sell_status = "N" LIMIT 0, 10 ;
    `;

    console.log('sql : ', sql);
    const [rows] = await DB.conn.query(sql);

    console.log('rows : ', rows);
    return rows;
};

DB.getNftDetailData = async ({ token_id, contract, user_seq }) => {

    console.log('user_seq : ', user_seq);
    console.log('token_id : ', token_id);
    console.log('contract : ', contract);

    // Combine SQL queries with a single execution (prepared statement)
    const sql = `
    SELECT
        m.*,
        (SELECT COUNT(*) FROM mtb_market_like WHERE mk_seq = m.seq AND user_seq = ?) AS is_liked        
    FROM vw_mtb_market AS m
        -- LEFT JOIN mtb_nft AS nft
        -- ON (m.token_id = nft.token_id AND m.contract = nft.contract)
    WHERE
        m.token_id = ? AND m.contract = ?
    `;

    const [rows] = await DB.conn.query(sql, [user_seq, token_id, contract]);
    console.log(rows[0]);

    // Return first row (should be the only one)
    return rows[0];
};




DB.getExchangeData = async ({ symbol }) => {
    var sql =
        'SELECT coin_usdt, coin_krw, high, low, change_rate, sales_amount, trans_fee, sale_fee, presales_amount, od_num FROM stb_exchange WHERE symbol = ?';
    const [rows] = await DB.conn.query(sql, symbol);
    return rows[0];
};


DB.setNftSellState = async ({ state, contract, tokenId }) => {
    var sql =
        'UPDATE mtb_market SET sell_status = ?, upt_dttm = NOW()  WHERE contract = ? AND token_id = ?';

    var params = [state, contract, tokenId];

    const [rows] = await DB.conn.query(sql, params);
    return rows;
};


DB.setUsercETHBalanceDown = async ({ value, seq }) => {
    var sql =
        'UPDATE mtb_user SET ceth_balance = ceth_balance - ?  WHERE seq = ?';

    var params = [value, seq];

    const [rows] = await DB.conn.query(sql, params);
    return rows;
};


DB.setNftBuyUserInfo = async ({ seq, wallet_addr, contract, tokenId }) => {
    var sql =
        'UPDATE mtb_market SET buy_user_seq = ?, buy_addr = ?, sell_dttm = NOW()  WHERE contract = ? AND token_id = ?';

    var params = [seq, wallet_addr, contract, tokenId];

    const [rows] = await DB.conn.query(sql, params);
    return rows;
};

DB.setNftSellUserInfo = async ({ seq, wallet_addr, contract, tokenId, category, date, description, amount }) => {
    // var sql =
    //     'UPDATE mtb_market SET user_seq = ?, sell_addr = ?, category =?, sell_period = ?, end_dttm = DATE_ADD(NOW(), INTERVAL ? DAY), description = ?, start_ceth = ?, curr_ceth = ?, start_dttm = NOW(), buy_user_seq = ?, buy_addr = ?, sell_status = "N"  WHERE contract = ? AND token_id = ?';
    var sql = `
        UPDATE mtb_market 
        SET user_seq = ?, sell_addr = ?, category =?, sell_period = ?, 
            end_dttm = DATE_ADD(NOW(), INTERVAL ? DAY), description = ?, 
            start_ceth = ?, curr_ceth = ?, start_dttm = NOW(), buy_user_seq = ?, buy_addr = ?, sell_status = "N"  
        WHERE contract = ? AND token_id = ?
        `;

    var sell_period = 0;
    if (date > 100) {
        sell_period = null;
    } else {
        sell_period = date;
    }

    var params = [seq, wallet_addr, category, sell_period,
        date, description, amount, amount, null, null, contract, tokenId];

    const [rows] = await DB.conn.query(sql, params);
    return rows;
};

// 판매자의 user_seq도 저장해야 한다
DB.setMarketBuyData = async ({ seller_user_seq, mk_seq, amount_ceth, txid, sell_addr, user, tokenId, contract }) => {
    // org
    // var sql =
    //     `INSERT INTO mtb_market_buy 
    //         (user_seq, mk_seq, amount_ceth, txid, sell_addr, buy_user_seq, buy_addr, buy_dttm)             
    //     VALUES 
    //         (?, ?, ?, ?, ?, ?, ?, NOW())`;

    var sql =
        `INSERT INTO mtb_market_buy 
            (user_seq, mk_seq, amount_ceth, txid, sell_addr, buy_user_seq, buy_addr, buy_dttm, token_id, contract)
        VALUES 
            (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`;


    var params = [
        seller_user_seq,
        mk_seq,
        amount_ceth,
        txid,
        sell_addr,
        user?.seq,
        user?.wallet_addr,
        tokenId,
        contract
    ];

    const [rows] = await DB.conn.query(sql, params);
    return rows;
};


DB.getNftBuyList = async ({ mk_seq }) => {
    // var sql =
    //     'SELECT seq, mk_seq, user_seq, amount_ceth, txid, sell_addr, buy_user_seq, buy_addr, buy_dttm FROM mtb_market_buy WHERE mk_seq = ? ORDER BY seq DESC';
    var sql = `
        SELECT 
            seq, mk_seq, user_seq, amount_ceth, txid, sell_addr, buy_user_seq, buy_addr, buy_dttm 
        FROM 
            mtb_market_buy 
        WHERE 
            mk_seq = ? 
        ORDER BY seq DESC LIMIT 3;`;
    const [rows] = await DB.conn.query(sql, [mk_seq]);
    return rows;
};



DB.setSwapInfo = async ({ user_seq, wallet_addr, txid, symbol, amount }) => {
    // var sql =
    //     "INSERT INTO mtb_user_swap (user_seq, wallet_addr, from_symbol, txid, swap_status, ins_dttm) VALUES (?,?,'ETH', ?, 'W', NOW())";
    var sql = `
        INSERT INTO mtb_user_swap 
            (user_seq, wallet_addr, from_symbol, txid, swap_status, ins_dttm, from_amount) 
        VALUES 
            (?, ?, ?, ?, 'W', NOW(), ?);
        `;

    var params = [user_seq, wallet_addr, symbol, txid, amount];

    const [rows] = await DB.conn.query(sql, params);
    return rows;
};


// MARKETPLACE 좋아요
DB.setMarketplaceLike = async (user_seq, mk_seq) => {
    try {
        let state = false;
        var ret = await DB.checkMarketplaceLike(user_seq, mk_seq);

        console.log(ret);

        // Start a transaction
        // await DB.conn.beginTransaction();

        if (ret == false) {
            const sql = `
            DELETE FROM mtb_market_like
            WHERE
               mk_seq = ?
            AND user_seq = ?;
            `;
            const [result] = await DB.conn.query(sql, [mk_seq, user_seq]);
            console.log('result : ' + result);
            state = false;

            const sqlDecrease = `
            UPDATE mtb_nft
            INNER JOIN mtb_market ON mtb_nft.token_id = mtb_market.token_id AND mtb_nft.contract = mtb_market.contract
            SET mtb_nft.like_cnt = mtb_nft.like_cnt - 1
            WHERE mtb_market.seq = ?;
            `;
            await DB.conn.query(sqlDecrease, [mk_seq]);
        } else {
            const sql = `
            INSERT INTO mtb_market_like
                (mk_seq, user_seq, reg_dttm)
            VALUES
                (?, ?, NOW())`;

            const [result] = await DB.conn.query(sql, [mk_seq, user_seq]);
            console.log('result : ' + result);
            state = true;

            const sqlIncrease = `
            UPDATE mtb_nft
            INNER JOIN mtb_market ON mtb_nft.token_id = mtb_market.token_id AND mtb_nft.contract = mtb_market.contract
            SET mtb_nft.like_cnt = mtb_nft.like_cnt + 1
            WHERE mtb_market.seq = ?;
            `;
            await DB.conn.query(sqlIncrease, [mk_seq]);
        }

        // Commit the transaction
        // await DB.conn.commit();

        return {
            state: state
        };
    } catch (err) {
        console.log(err);
        console.error(err);

        // If there's an error, rollback the transaction
        // await DB.conn.rollback();

        return {
            state: false
        };
    } finally {
        // Release the connection back to the pool
        // DB.conn.release();
    }
}

DB.checkMarketplaceLike = async (user_seq, mk_seq) => {
    try {
        const sql = `
        SELECT 
            *
        FROM 
            mtb_market_like
        WHERE 
            mk_seq = ?
            AND user_seq = ?;
        `;

        console.log('sql : ' + sql);
        const params = [mk_seq, user_seq];
        const [rows] = await DB.conn.query(sql, params);
        console.log(rows);
        if (rows.length == 0) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.log(err);
        console.error(err);

        return false;
    }
}

// 거래내역리스트
// transaction_type B = BUY(구매), S = SELL(판매)
DB.getHistoryList = async ({
    limit,
    pageParam,
    offset,
    user_seq,
}) => {
    let sql = `
        SELECT *,
            CASE
                WHEN mb.user_seq = ? THEN 'S'
                WHEN mb.buy_user_seq = ? THEN 'B'
            END AS transaction_type,
            n.contract,
            n.token_id,
            n.img_src,
            n.nft_name
        FROM 
            mtb_market_buy mb            
            INNER JOIN
                mtb_nft n ON (mb.token_id = n.token_id AND mb.contract = n.contract)
        WHERE 
            mb.user_seq = ? OR mb.buy_user_seq = ?
            ORDER BY mb.seq DESC
    `;

    let params = [user_seq, user_seq, user_seq, user_seq];
    if (limit && pageParam > -1) {
        sql = sql + ' LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset)); // Convert limit and offset to numbers
    }

    console.log('sql', sql)
    const [rows] = await DB.conn.query(sql, params);
    return rows;
};

// 거래내역리스트 카운트
DB.getHistoryListCnt = async ({ user_seq }) => {
    // let sql = `
    // SELECT         
    //     COUNT(*) AS cnt
    // FROM 
    //     mtb_market_buy 
    // WHERE 
    //     user_seq = ? OR buy_user_seq = ?
    // `;

    let sql = `
        SELECT *,
            COUNT(*) AS cnt
        FROM 
            mtb_market_buy mb
            INNER JOIN 
                mtb_market m ON mb.mk_seq = m.seq
            INNER JOIN 
                -- mtb_nft n ON (mb.token_id = n.token_id AND m.contract = n.contract)
                mtb_nft n ON (m.token_id = n.token_id AND m.contract = n.contract)
        WHERE 
            mb.user_seq = ? OR mb.buy_user_seq = ?
    `;

    let params = [user_seq, user_seq, user_seq, user_seq];
    const [rows] = await DB.conn.query(sql, params);
    return rows[0];
};

// 스왑내역리스트
DB.getSwapHistoryList = async ({
    limit,
    pageParam,
    offset,
    user_seq,
}) => {
    let sql = `
        SELECT
            *
        FROM 
            mtb_user_swap
        WHERE 
            user_seq = ?
        ORDER BY SEQ DESC
    `;

    let params = [user_seq];
    if (limit && pageParam > -1) {
        sql = sql + ' LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset)); // Convert limit and offset to numbers
    }

    console.log('sql', sql)
    const [rows] = await DB.conn.query(sql, params);
    return rows;
};

// 스왑내역리스트 카운트
DB.getSwapHistoryListCnt = async ({ user_seq }) => {
    let sql = `
        SELECT 
            COUNT(*) AS cnt
        FROM 
            mtb_user_swap
        WHERE 
            user_seq = ?
    `;

    let params = [user_seq];
    const [rows] = await DB.conn.query(sql, params);
    return rows[0];
};

// 좋아요리스트
DB.getLikeList = async ({
    search,
    category,
    sale,
    priceStart,
    priceEnd,
    sort,
    limit,
    pageParam,
    offset,
    user_seq,
}) => {
    var sql =
        `SELECT 
            a.seq, a.user_seq, a.token_id, a.contract, a.mtype, a.sell_addr, a.sell_type, a.sell_period, a.category, 
            a.description, a.start_ceth, a.curr_ceth, a.start_dttm, a.end_dttm, a.buy_user_seq, a.buy_addr, a.sell_status, 
            a.sell_dttm, a.ins_dttm, a.upt_dttm, b.img_src, b.nft_name, b.like_cnt
        FROM 
            mtb_market a 
        LEFT JOIN 
            mtb_nft b ON a.token_id = b.token_id AND a.contract = b.contract
        INNER JOIN
            mtb_market_like c ON a.seq = c.mk_seq
        WHERE a.sell_status <> 'C'`;

    let params = [];

    if (user_seq !== null && user_seq !== 'null') {
        sql += " AND c.user_seq = ?";
        params.push(user_seq);
    }

    if (search != '') {
        sql += " AND (b.nft_name LIKE ? OR b.description LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
    }

    if (category != '') {
        let cg = Array.isArray(category) ? category.join(',') : category;
        sql += " AND a.category IN (?)";
        params.push(cg);
    }

    if (priceStart && priceEnd && priceStart != 0 && priceEnd != 0) {
        sql += " AND a.curr_ceth >= ? AND a.curr_ceth <= ?";
        params.push(priceStart, priceEnd);
    }

    if (sort == 'new') {
        sql = sql + ' ORDER BY a.ins_dttm DESC';
    } else if (sort == 'like') {
        sql = sql + ' ORDER BY b.like_cnt DESC';
    } else if (sort == 'end') {
        // 경매
        if (sale != 'auction') {
            sql = sql + " AND a.sell_type = 'A'";
        }
        sql = sql + ' ORDER BY a.end_dttm ASC';
    } else if (sort == 'low') {
        // 경매
        sql = sql + ' ORDER BY a.curr_ceth ASC';
    } else if (sort == 'high') {
        // 경매
        sql = sql + ' ORDER BY a.curr_ceth DESC';
    }

    if (limit && pageParam > -1) {
        sql = sql + ' LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset)); // Convert limit and offset to numbers
    }

    console.log('sql', sql)
    const [rows] = await DB.conn.query(sql, params);
    return rows;
};

// 좋아요리스트 카운트
DB.getLikeListCnt = async ({
    search,
    category,
    priceStart,
    priceEnd,
    user_seq,
}) => {
    var sql =
        `SELECT 
            COUNT(*) AS cnt
        FROM 
            mtb_market a 
        LEFT JOIN 
            mtb_nft b ON a.token_id = b.token_id AND a.contract = b.contract
        INNER JOIN
            mtb_market_like c ON a.seq = c.mk_seq
        WHERE a.sell_status <> 'C'`;

    let params = [];

    if (user_seq !== null && user_seq !== 'null') {
        sql += " AND c.user_seq = ?";
        params.push(user_seq);
    }

    if (search != '') {
        sql += " AND (b.nft_name LIKE ? OR b.description LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
    }

    if (category != '') {
        let cg = Array.isArray(category) ? category.join(',') : category;
        sql += " AND a.category IN (?)";
        params.push(cg);
    }

    if (priceStart && priceEnd && priceStart != 0 && priceEnd != 0) {
        sql += " AND a.curr_ceth >= ? AND a.curr_ceth <= ?";
        params.push(priceStart, priceEnd);
    }

    const [rows] = await DB.conn.query(sql, params);
    return rows[0];
};

DB.setMarketplaceCancel = async ({
    mk_seq
}) => {
    if (!mk_seq) {
        console.log('mk_seq is required');
        return false;
    }

    try {
        const sql =
            `UPDATE mtb_market
            SET sell_status = 'C'
            WHERE seq = ?;`;

        const [rows] = await DB.conn.query(sql, [mk_seq]);
        console.log('mk_seq : ', mk_seq);
        console.log('sql : ', sql);
        console.log('rows : ', rows);

        return true;
    } catch (err) {
        console.log(err);
        console.error(err);
        return false;
    }
};

module.exports = DB;


