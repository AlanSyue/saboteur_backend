import { Request, Response } from "express";
import { BbsModel } from "../../models/bbs.models"

const typeChecker = (type) => {
    if (['fun', 'suggestion'].includes(type)) {
        return true;
    }

    return false;
}

export const getData = async function (req: Request, res: Response) {
    const type = req.query.type;

    let searchObject = {};
    if (typeChecker(type)) {
        searchObject = {
            type: type
        }
    }

    const bbsData = await BbsModel.find(searchObject).limit(10).exec();
    return res.json({
        status: '200',
        data: bbsData,
    });
};

export const create = async function (req: Request, res: Response) {

    if (!typeChecker(req.body.type)) {
        return res.json({
            status: '422',
            message: 'type wrong'
        });
    }

    if (
        req.body.nickname === ''
        || req.body.content === ''
    ) {
        return res.json({
            status: '422',
            message: 'send error'
        });
    }

    req.body.created_date = getCurrentDate();

    await new BbsModel(req.body).save();

    return res.json({
        status: '200',
    });
};

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String((today.getMonth() + 1)).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}/${month}/${day}`;
}
