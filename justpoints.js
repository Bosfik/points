const puppeteer = require('puppeteer')
const fetch = require('node-fetch')
const proxyChain = require('proxy-chain');

async function getPoints(){
  const oldProxyUrl = ''; //ur proxy in http://LOGIN:PASSWORD@HOST:PORT  format
  const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);
  const browser = await puppeteer.launch({
    args: [ `--proxy-server=${newProxyUrl}` ]
    
  });
    const page = await browser.newPage();
    await page.setUserAgent('') //user agent
    await page.setExtraHTTPHeaders({
        //headers
        })
        await page.goto(`https://core-api.prod.blur.io/v1/user/rewards/wallet-compact`);
        data = await page.evaluate(() => {
          return document.querySelector('pre').textContent;
          });
        await browser.close();
        let jsoned = JSON.parse(data)
        return [jsoned.wallet.totalXp, jsoned.wallet.rank, jsoned.wallet.blendTotalXp, jsoned.wallet.bidTotalXp] 
  }

  async function sendDiscordMessage(content) {
    let whurl = '' //webhook URL
    try {
      const response = await fetch(whurl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to send Discord message: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function run() {
    let data = await getPoints()
    let previousPoints = data[0]
    let previousRank = data[1]
    let previousLoanPoints = data[2]
    let previousBidPoints = data[3]
    let currentPoints
    let currentRank
    let currentLoanPoints
    let currentBidPoints
    
    while (true) {
      try {
        data = await getPoints()
        currentPoints = data[0]
        currentRank = data[1]
        currentLoanPoints = data[2]
        currentBidPoints = data[3]
        console.log(`points: ${currentPoints}, rank: ${currentRank}`)
        
        if (previousPoints !== currentPoints && previousRank > currentRank) {
          await sendDiscordMessage(`📈#${previousRank} -> #${currentRank}\nTotal: ${previousPoints.toFixed(4)} -> ${currentPoints.toFixed(4)} (+${(currentPoints - previousPoints).toFixed(4)})\nBid: ${previousBidPoints.toFixed(4)} -> ${currentBidPoints.toFixed(4)} (+${(currentBidPoints - previousBidPoints).toFixed(4)})\nLoan: ${previousLoanPoints.toFixed(4)} -> ${currentLoanPoints.toFixed(4)} (+${(currentLoanPoints - previousLoanPoints).toFixed(4)})`)
        }

        else if (previousPoints !== currentPoints && previousRank < currentRank) {
          await sendDiscordMessage(`📉#${previousRank} -> #${currentRank}\nTotal: ${previousPoints.toFixed(4)} -> ${currentPoints.toFixed(4)} (+${(currentPoints - previousPoints).toFixed(4)})\nBid: ${previousBidPoints.toFixed(4)} -> ${currentBidPoints.toFixed(4)} (+${(currentBidPoints - previousBidPoints).toFixed(4)})\nLoan: ${previousLoanPoints.toFixed(4)} -> ${currentLoanPoints.toFixed(4)} (+${(currentLoanPoints - previousLoanPoints).toFixed(4)})`)
        }

        else if (previousPoints !== currentPoints) {
          await sendDiscordMessage(`Total: ${previousPoints.toFixed(4)} -> ${currentPoints.toFixed(4)} (+${(currentPoints - previousPoints).toFixed(4)})\nBid: ${previousBidPoints.toFixed(4)} -> ${currentBidPoints.toFixed(4)} (+${(currentBidPoints - previousBidPoints).toFixed(4)})\nLoan: ${previousLoanPoints.toFixed(4)} -> ${currentLoanPoints.toFixed(4)} (+${(currentLoanPoints - previousLoanPoints).toFixed(4)})`)
        }

        previousPoints = currentPoints
        previousRank = currentRank
        previousBidPoints = currentBidPoints
        previousLoanPoints = currentLoanPoints

    
      } catch(err) {
        console.log(err)
      }
    
      const delaySeconds = Math.floor(Math.random() * 6) + 15
      await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000))
    }
  }
  
  run();
