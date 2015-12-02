/**
 * Created by MIC on 2015/12/2.
 */

export interface TbProjectDetailResponse {
    /**
     * 响应结果
     */
    status:number;
    /**
     * 详细数据，见下文
     */
    data:TbProjectDetailData;
}

export interface TbProjectDetailData {
    /**
     * 项目名称
     */
    name:string;
    /**
     * 项目图片链接（不带协议）
     */
    image:string;
    /**
     * 淘宝商铺ID
     */
    shopId:string;
    /**
     * 发起日期
     */
    begin_date:string;
    /**
     * 截止日期
     */
    end_date:string;
    /**
     * 创建用户ID
     */
    user_id:string;
    /**
     * 用户昵称？
     * 但是实际并不显示出来，我没登录淘宝所以不知道是不是两边的可以独立设置。
     */
    nick:string;
    /**
     * 你是否关注了此项目
     */
    focus:number;
    /**
     * “喜欢”的数量
     */
    focus_count:string;
    /**
     * 目标金额
     */
    target_money:string;
    /**
     * 已购买人数
     */
    support_person:string;
    /**
     * 已筹金额
     */
    curr_money:string;
    /**
     * 完成进度(%)
     */
    finish_per:string;
    /**
     * 剩余天数
     */
    remain_day:string;
    /**
     * 状态描述
     */
    status:string;
    /**
     * 状态码 (1/2/3)
     */
    status_value:string;
    /**
     * 不知道是什么，页面未用
     */
    seek_days:string;
    /**
     * 同前
     */
    plan_date:string;
    /**
     * 同前
     */
    plan_end_date:string;
    /**
     * 同前
     */
    plan_end_days:string;
    /**
     * 项目总体是否还可继续购买
     */
    can_buy:number;
    /**
     * 购买按钮显示文字
     */
    buy_btn:string;
    /**
     * 项目描述（主体）
     */
    desc:string;
    /**
     * 项目描述（显示在主体之前）
     */
    content:string;
    /**
     * 视频连接（不带协议）
     */
    video:string;
    /**
     * 二维码图片链接（不带协议）
     */
    qrcode:string;
    /**
     * 不知道是什么
     */
    deposit_rati:string;
    /**
     * 发布用户概要
     */
    person:TbUserAbstract;
    /**
     * 各个价格档
     */
    items:TbProjectItem[];
    /**
     * FAQ
     */
    faqs:TbProjectFaq[];
}

export interface TbUserAbstract {
    /**
     * 发布用户名，这个用户显示在众筹项目页面上
     */
    name:string;
    /**
     * 用户头像
     */
    image:string;
    /**
     * 发布用户名下方的描述
     */
    desc:string;
}

export interface TbProjectItem {
    /**
     * 具体宝贝的ID
     */
    item_id:string;
    /**
     * 价格
     */
    price:string;
    /**
     * 本价格档描述
     */
    desc:string;
    /**
     * 预计回报发放时间（天），筹款成功后开始计算
     */
    make_days:string;
    /**
     * 已购买人数
     */
    support_person:string;
    /**
     * 到货方式（110000/1=全国包邮不含港澳台,0=不需要物流,710000=全国包邮含港澳台）
     */
    is_express:string;
    /**
     * 缩略图链接（不带协议）
     */
    images:string;
    /**
     * 是否可购买
     */
    can_buy:string;
    /**
     * 购买链接，通往淘宝店
     */
    buy_url:string;
    /**
     * 本价格档标题
     */
    title:string;
    /**
     * 总计份数
     */
    total:number;
}

export interface TbProjectFaq {
    faq_id:string;
    question:string;
    answer:string;
}
