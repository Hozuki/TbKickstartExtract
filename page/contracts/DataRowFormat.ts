/**
 * Created by MIC on 2015/12/2.
 */

export interface DataRowFormat {
    id?:number;
    type?:number;
    name?:string;
    url?:string;
    lowest_price?:number;
    lowest_price_person?:number;
    hottest_price?:number;
    hottest_price_person?:number;
    is_hottest_price_full?:number;
    most_money_price?:number;
    most_money_price_person?:number;
    project_state?:number;
    project_tb_state?:number;
    project_state_text?:string;
    total_money?:number;
    total_person?:number;
    target_money?:number;
    is_succeeded?:number;
    like_count?:number;
}
