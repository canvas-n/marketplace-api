const jwt = require('jsonwebtoken');
const db = require('../db.js');
const requestIp = require('request-ip');
const bcrypt = require('bcrypt');
const Web3 = require("web3");
const ethers = require("ethers");
const { Alchemy, Network } = require("alchemy-sdk");
require('dotenv').config();

// Configures the Alchemy SDK
const config = {
    apiKey: process.env.API_KEY, // Replace with your API key
    network: Network.ETH_SEPOLIA, // Replace with your network
};

exports.getHomeGallery = async (req, res) => {
    try {
        const galleryList = await db.getHomeGalleryList();
        const { nft_author } = await db.getHomeGalleryAuthor();

        res.status(200).json({
            success: true,
            data: { galleryList, nft_author: nft_author },
            msg: '',
        });
    } catch (e) {
        console.error('error', e);
        res.status(500).json({ success: false, data: null, msg: e.message });
    }
};

exports.getHomeTopLank = async (req, res) => {
    try {
        const topNftList = await db.getHomeTopNftList();
        const topSaleList = await db.getHomeTopSaleList();

        res.status(200).json({
            success: true,
            data: { topNftList, topSaleList },
            msg: '',
        });
    } catch (e) {
        console.error('error', e);
        res.status(500).json({ success: false, data: null, msg: e.message });
    }
};

exports.getHomeAuction = async (req, res) => {
    try {
        const auctionList = await db.getHomeAuction();

        res.status(200).json({
            success: true,
            data: { auctionList },
            msg: '',
        });
    } catch (e) {
        console.error('error', e);
        res.status(500).json({ success: false, data: null, msg: e.message });
    }
};

exports.getHomeNewNft = async (req, res) => {
    try {
        const newNftList = await db.getHomeNewNft();

        res.status(200).json({
            success: true,
            data: { newNftList },
            msg: '',
        });
    } catch (e) {
        console.error('error', e);
        res.status(500).json({ success: false, data: null, msg: e.message });
    }
};

exports.getHeaderGallery = async (req, res) => {
    try {
        const authorList = await db.getAuthor();

        res.status(200).json({
            success: true,
            data: { authorList },
            msg: '',
        });
    } catch (e) {
        console.error('error', e);
        res.status(500).json({ success: false, data: null, msg: e.message });
    }
};

exports.getGalleyList = async (req, res) => {
    let { tab, pageParam } = req.query;

    if (!tab) {
        tab = 'Kurumi';
    }

    try {
        let limit = 6;
        let offset = 0;
        if (pageParam > 0) {
            offset = 6;
            offset = offset * pageParam;
        }

        const galleryList = await db.getGalleyList({
            tab,
            limit,
            pageParam,
            offset,
        });
        const { cnt } = await db.getGalleryCnt({ tab });

        // 인피니티 스크롤 확인
        let last = false;
        if (cnt < pageParam * limit) {
            last = true;
        }

        res.status(200).json({
            success: true,
            data: { galleryList, last: last },
            msg: '',
        });
    } catch (e) {
        console.error('error', e);
        res.status(500).json({ success: false, data: null, msg: e.message });
    }
};


// NFT 상세페이지
exports.getNftDetail = async (req, res) => {
    // 비밀번호를 제외한 유저정보를 넘겨준다
    const { token_id, contract } = req.query;

    try {
        // 로그인된 유저에 한해서
        const user_seq = req.user?.seq;

        console.log('req.user : ', req.user);

        console.log('user_seq : ', user_seq);
        console.log('token_id : ', token_id);
        console.log('contract : ', contract);
        console.log('================================');

        const nftDetail = await db.getNftDetailData({ token_id, contract, user_seq });
        console.log('nftDetail?.seq', nftDetail?.seq)
        const nftHistory = await db.getNftBuyList({ mk_seq: nftDetail?.seq });

        const exchangeData = await db.getExchangeData({ symbol: 'CETH' })


        nftDetail.sale_fee = nftDetail.curr_ceth * exchangeData.sale_fee;
        nftDetail.total_price = parseFloat(nftDetail.curr_ceth) + parseFloat(nftDetail.sale_fee);
        nftDetail.coin_krw = nftDetail.total_price * exchangeData.coin_krw;

        nftDetail.nftHistory = nftHistory;
        nftDetail.exchangeData = exchangeData;



        /*
                // #2-2 - 작가의 다른 작품
                const auNftData = await db.getAuNft({ au_code: nftDetail.au_code });

                // #2-3 - tb_market
                const nftMarketData = await db.getNftMarket({
                    token_id: nftDetail.token_id,
                });

                var nftBidData = '';
                if (nftMarketData.sell_type == 'A') {
                    nftBidData = await db.getNftBid({ seq: nftMarketData.seq });
                } else {
                    nftBidData = false;
                }

                const nftEventData = await db.getNftEventList({
                    token_id: nftDetail.token_id,
                });
                const nftPriceData = await db.getPriceHistory({
                    token_id: nftDetail.token_id,
                });*/

        res.status(200).json({
            success: true,
            data: {
                nftDetail
            },
            msg: '',
        });
    } catch (e) {
        console.error('error', e);
        res.status(500).json({ success: false, data: null, msg: e.message });
    }
};

exports.sellNft = async (req, res) => {
    try {
        //const authorList = await db.getAuthor();
        const user = req.user;
        const { amount, date, category, description, nft, txid, mtype } =
            req.body;
        const marketNft = await db.getNftMarketSellData({
            token_id: nft?.tokenId,
            contract: nft?.contract?.address,
        });

        console.log('sellNft ============================');

        // date = null 불가 setNftMarketSellData() 함수에서 시작일에 대한 설정을 할수 없음

        console.log('marketNft', marketNft)
        // DB에서 이미 판매 등록 된 상태인지 검색
        if (marketNft?.cnt > 0) {
            console.log('이미 판매중인 NFT 입니다.');
            console.log('marketNft.sell_status', marketNft.sell_status);
            if (marketNft?.sell_status === "N") {
                // 이미 판매 등록이 되어 있다면 return
                return res.status(400).json({
                    success: false,
                    data: null,
                    msg: '이미 판매 등록 된 NFT 입니다.',
                });
            } else {
                let dateTime = date;
                if (date === "infinity") {
                    // dateTime = null;
                    dateTime = 365 * 100;
                }
                // 판매자 정보 업데이트
                const result = await db.setNftSellUserInfo({
                    seq: user?.seq,
                    wallet_addr: user?.wallet_addr,
                    amount,
                    date: dateTime,
                    category,
                    description,
                    tokenId: nft?.tokenId,
                    contract: nft?.contract?.address,
                    txid,
                    mtype,
                });

                return res.status(200).json({
                    success: true,
                    data: {},
                    msg: '상품이 판매등록 되었습니다.',
                });
            }
        } else {
            console.log('신규 등록하는  NFT 입니다.');

            let dateTime = date;
            if (date === "infinity") {
                // dateTime = null;
                dateTime = 365 * 100;
            }
            // user, amount, category, description, nft, txid, mtype 정보를 출력한다
            console.log(`User: ${user}`);
            console.log(`Amount: ${amount}`);
            console.log(`Category: ${category}`);
            console.log(`Description: ${description}`);
            console.log(`NFT: ${nft}`);
            console.log(`Transaction ID: ${txid}`);
            console.log(`Type: ${mtype}`);
            console.log(`dateTime: ${dateTime}`);

            // 등록이 안되어 있다면 mtb_market 에 sell_status N 으로 insert
            const result = await db.setNftMarketSellData({
                user,
                amount,
                date: dateTime,
                category,
                description,
                nft,
                txid,
                mtype,
            });

            const result2 = await db.setNftSellData({
                nft, user
            });

            console.log('result', result);
            console.log('result2', result2);

            res.status(200).json({
                success: true,
                data: {},
                msg: '상품이 판매등록 되었습니다.',
            });
        }
    } catch (e) {
        console.error('error', e);
        res.status(500).json({ success: false, data: null, msg: e.message });
    }
};

exports.getRecommendNftList = async (req, res) => {
    try {
        const recommList = await db.getRecommNftsList();

        res.status(200).json({
            success: true,
            data: { recommList },
            msg: '',
        });
    } catch (e) {
        console.error('error', e);
        res.status(500).json({ success: false, data: null, msg: e.message });
    }
};

async function getOwner(contractAddress, tokenId) {
    console.log('getOwner : ', contractAddress, tokenId);

    // Creates an Alchemy object instance with the config to use for making requests
    const alchemy = new Alchemy(config);

    //Call the method to fetch the owners for the collection
    const response = await alchemy.nft.getOwnersForNft(contractAddress, tokenId)

    //Logging the response to the console
    console.log('res : ', response);

    return response.owners[0];
}

exports.buyNft = async (req, res) => {
    try {
        //const authorList = await db.getAuthor();
        const user = req.user;
        const { contract, tokenId } =
            req.body;
        const marketNft = await db.getNftMarketSellData({
            token_id: tokenId,
            contract,
        });

        console.log('contract, tokenId', contract, tokenId)
        console.log('marketNft', marketNft)
        const exchangeData = await db.getExchangeData({ symbol: 'CETH' })

        const userData = await db.getUserData(user?.wallet_addr);

        // DB에서 이미 판매 등록 된 상태인지 검색
        if (marketNft?.cnt < 1) {
            // 이미 판매 등록이 되어 있다면 return
            return res.status(400).json({
                success: false,
                data: null,
                msg: '구매할 수 없는 NFT 입니다.',
            });
        } else {
            // 금액검사
            const sell_price = marketNft?.curr_ceth
            const sell_fee = exchangeData?.sale_fee
            var total_price = 0;
            total_price = parseFloat(sell_price) + parseFloat(sell_price * sell_fee);
            // const total_price = parseFloat(sell_price) + parseFloat(sell_fee);

            console.log('total_price', total_price);
            if (parseFloat(userData?.ceth_balance) < total_price) {
                return res.status(402).json({
                    success: false,
                    data: null,
                    msg: '보유 금액이 부족합니다.',
                });
            }

            // 소유자 체크            
            const owner = await getOwner(contract, tokenId);
            if (owner.toLowerCase() !== marketNft.sell_addr.toLowerCase()) {
                console.log('nft의 현재 소유자가 다릅니다 : ');
                console.log('마켓에서의 소유자 : ', marketNft.sell_addr);
                console.log('nft의 현재 소유자 : ', owner);
                return res.status(400).json({
                    success: false,
                    data: null,
                    msg: 'The NFT is not owned by the seller.',
                });
            }

            // master 가 transfer 실행
            const provider = new ethers.AlchemyProvider('sepolia', 'KlvtuazyycOk8uzl8zlSK8pAV5e5BOaZ')

            const tokenURIABI = JSON.parse(process.env.NFT_ABI);

            let privateKey = process.env.NFT_MASTER_PRIVATE_KEY;
            let wallet = new ethers.Wallet(privateKey, provider);

            const web3 = new Web3(`https://${process.env.NETWORK}.g.alchemy.com/v2/${process.env.API_KEY}`);

            const tokenContract = new web3.eth.Contract(
                tokenURIABI,
                contract,
            );

            const encoded = await tokenContract.methods
                .transferFrom(marketNft.sell_addr, user?.wallet_addr, tokenId)
                .encodeABI();

            console.log('marketNft.sell_addr, user?.wallet_addr', marketNft.sell_addr, user?.wallet_addr)

            const tx = await wallet.sendTransaction({
                to: contract, // Required except during contract publications.
                from: process.env.NFT_MASTER_ADDRESS, // must match user's active address.
                value: "0x0", // Only required to send ether to the recipient from the initiating external account.
                data: encoded, // Optional, but used for defining smart contract creation and interaction.z
            });
            console.log("tx", tx);
            // 금액차감

            await db.setUsercETHBalanceDown({ value: total_price, seq: user?.seq })
            await db.setNftSellState({ state: 'S', contract, tokenId })
            await db.setNftBuyUserInfo({ seq: user?.seq, wallet_addr: user?.wallet_addr, tokenId, contract })

            // org
            // await db.setMarketBuyData({mk_seq: marketNft?.seq, sell_addr: marketNft?.sell_addr,amount_ceth: total_price, txid: tx?.hash, user})
            // 판매자 user_seq 저장
            const seller_user_seq = marketNft.user_seq;
            console.log('seller_user_seq : ', seller_user_seq);
            await db.setMarketBuyData({
                seller_user_seq: seller_user_seq,
                mk_seq: marketNft?.seq,
                sell_addr: marketNft?.sell_addr,
                amount_ceth: total_price,
                txid: tx?.hash,
                user,
                tokenId,
                contract
            })

            res.status(200).json({
                success: true,
                data: {},
                msg: '상품을 구매 완료 하였습니다.',
            });
        }
    } catch (e) {
        console.error('error', e);
        res.status(500).json({ success: false, data: null, msg: e.message });
    }
};


exports.cancelSellNft = async (req, res) => {
    try {
        const user = req.user;
        const { contract, tokenId } =
            req.body;
        const marketNft = await db.getNftMarketSellData({
            token_id: tokenId,
            contract,
        });

        if (marketNft?.user_seq != user?.seq) {
            // 이미 판매 등록이 되어 있다면 return
            return res.status(400).json({
                success: false,
                data: null,
                msg: '본인이 등록한 NFT가 아닙니다.',
            });
        }

        if (marketNft?.cnt < 1) {
            // 이미 판매 등록이 되어 있다면 return
            return res.status(400).json({
                success: false,
                data: null,
                msg: '판매등록된 NFT가 아닙니다.',
            });
        }

        const result = await db.setNftSellState({ state: 'C', contract, tokenId })

        res.status(200).json({
            success: true,
            data: {},
            msg: '',
        });
    } catch (e) {
        console.error('error', e);
        res.status(500).json({ success: false, data: null, msg: e.message });
    }
};

