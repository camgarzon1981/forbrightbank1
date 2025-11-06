select email, count(*) as duplicate_count
from clients
group by email
having count(*) > 1;