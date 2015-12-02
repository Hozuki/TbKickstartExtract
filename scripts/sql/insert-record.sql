INSERT INTO main (
    id, type, name, url, lowest_price, lowest_price_person, hottest_price, hottest_price_person, is_hottest_price_full,
    most_money_price, most_money_price_person, project_state, project_tb_state, project_state_text, total_money, total_person,
    target_money, is_succeeded, like_count
) VALUES (
    @id, @type, @name, @url, @lowest_price, @lowest_price_person, @hottest_price, @hottest_price_person, @is_hottest_price_full,
    @most_money_price, @most_money_price_person, @project_state, @project_tb_state, @project_state_text, @total_money, @total_person,
    @target_money, @is_succeeded, @like_count
);