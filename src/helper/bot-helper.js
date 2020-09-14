const TelegramBot = require("node-telegram-bot-api");
const { dlFile } = require("./common-helper.js");

const botToken = "333446529:AAFBWwDRV4eQ_3d19z8cPVvaLApuUX3cxmI";
const botOptions = { polling: true };
const bot = new TelegramBot(botToken, botOptions);

console.log("IN BOT-HELPER");

// Handle message receieved
bot.on('message', msg => {
    // Make logs
    console.log(msg);

    if (msg && msg.chat && msg.chat.type !== "private")
        return;

    if (msg && msg.text === "/start")
        bot.sendMessage(msg.from.id, "سلام، خوش آمدید.\r\nبرای شروع تصویری را بارگذاری نمایید.");

    if (msg && msg.text === "/getSubscribedUserCount") {

        getSubscribedUserCount(count => {
            const sendData = `تعداد افراد استفاده‌کننده: ${count}`;
            bot.sendMessage(msg.from.id, sendData);
        });
    }

    if (msg.photo == undefined)
        return;

    const fileId = msg.photo[msg.photo.length - 1].file_id;

    savedPhotoMsgId[msg.message_id] = fileId;

    const opts = {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: "#من_پدر_فرزندپذیرم - 👨‍🦰",
                    callback_data: `father_${msg.message_id}`
                }],
                [{
                    text: "#من_مادر_فرزندپذیرم - 👱‍♀️",
                    callback_data: `mother_${msg.message_id}`
                }],
                [{
                    text: "#ما_والدین_فرزندپذیریم - 👨‍👨‍👦",
                    callback_data: `parents_${msg.message_id}`
                }],
                [{
                    text: "#من_فرزندخوانده‌ام - 👦👧",
                    callback_data: `adopted_${msg.message_id}`
                }]
            ]
        },
        reply_to_message_id: msg.message_id
    };

    bot.sendMessage(msg.from.id, "لطفاً یک هشتگ را انتخاب کنید...", opts);
});

// Handle callback queries
bot.on("callback_query", (callbackQuery) => {
    const cbqData = callbackQuery.data;
    const msg = callbackQuery.message;

    // Make logs
    console.log(msg);

    if (msg && msg.chat && msg.chat.type !== "private")
        return;

    const cbDataAction = cbqData.split("_")[0];
    const cbMsgId = cbqData.split("_")[1] * 1;
    const cbFileId = savedPhotoMsgId[cbMsgId];

    // let text;
    let selectedImgOverlayKey = '';
    switch (cbDataAction) {
        case "father":
            // text = "👨‍🦰";
            selectedImgOverlayKey = cbDataAction;
            break;

        case "mother":
            // text = "👱‍♀️";
            selectedImgOverlayKey = cbDataAction;
            break;

        case "parents":
            // text = "👨‍👨‍👦";
            selectedImgOverlayKey = cbDataAction;
            break;

        case "adopted":
            // text = "👦👧";
            selectedImgOverlayKey = cbDataAction;
            break;

        default:
            text = "گزینه نامشخص";
    }

    // text = `شما "${text}" را انتخاب کردید.`;

    bot.deleteMessage(msg && msg.chat && msg.chat.id, msg.message_id);

    bot.getFile(cbFileId).then(async fileUri => {
        const fileUrl = `https://api.telegram.org/file/bot${botToken}/${fileUri.file_path}`;

        dlFile(fileUrl, async imgStream => {
            await bot.sendPhoto(msg.chat.id, imgStream, { reply_to_message_id: cbMsgId });
        });
    });
});
