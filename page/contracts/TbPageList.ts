/**
 * Created by MIC on 2015/12/2.
 */

export interface TbPageListResponse {
    /**
     * 响应结果
     */
    status:number;
    /**
     * 按照当前分页规模计算，总计的页面数
     */
    pageTotal:string;
    /**
     * 分页规模
     */
    pageSize:string;
    /**
     * 当前页面第一个项目的索引（从0开始）
     */
    pageNum:string;
    /**
     * 项目总数
     */
    total:string;
    /**
     * 数据数组，见下文
     */
    data:TbPageListItem[];
}

export interface TbPageListItem {
    /**
     * 项目ID
     */
    id:string;
    /**
     * 项目标签
     */
    tag:string[];
    /**
     * 图片URL（不带协议名称）
     */
    image:string;
    /**
     * 不知道是什么，页面未用
     */
    recommendPriceStr:string;
    /**
     * 目前累计资金（已筹金额）
     */
    curr_money:string;
    /**
     * 支持人数
     */
    buy_amount:string;
    /**
     * 达成率(%)
     */
    finish_per:string;
    /**
     * 剩余天数
     */
    remain_day:string;
    /**
     * 项目状态（文本）
     */
    status:string;
    /**
     * 项目状态，{1=失败, 2=进行, 3=成功}（值的文本形式），见淘宝的处理脚本
     * http://g.alicdn.com/tb/kickstarter/1.8.4/pages/detail_v2/page/init.js
     */
    status_value:string;
    /**
     * 目标金额
     */
    target_money:string;
    /**
     * 发起日期
     */
    begin_date:string;
    /**
     * 截止日期
     */
    end_date:string;
    /**
     * “喜欢”数
     */
    focus_count:string;
    /**
     * 类型ID，对应分类浏览时的大类
     */
    category_id:string;
    /**
     * 不知道是什么，页面未用
     */
    seek_days:string;
    /**
     * 前期计划开始日期
     */
    plan_date:string;
    /**
     * 前期计划截止日期（然后就开始发起）
     */
    plan_end_date:string;
    /**
     * 众筹页面链接
     */
    link:string;
    /**
     * 项目名称
     */
    name:string;
    /**
     * 淘宝物品链接
     */
    show_order:string;
}
