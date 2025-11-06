select count(*) as customer_count, date_trunc('month', createdAt) as month 
from clients where date_part('year', createdAt) = 2025 group by month order by month;