SQL, RDBMS, TL;DR.

Recently I was presented with a project from the [Viking Code School](http://vikingcodeschool.com) that requires the presentation of [time series](https://en.wikipedia.org/wiki/Time_series) data. If you are unfamiliar with the concept I will quickly break it down.

Time series data is information organized by a time interval. This interval could be any length of time, however it is common to use units like a day, week, month, year, etc..

## The problem

### Data structure

1. You have pieces of data associated with a point in time
1. The start time could be anywhere in the past
1. The end time could be anywhere in the future

### Desired outcome

1. You want to organize the data according to a time interval
1. You want to process the data efficiently
1. You want to process the data as fast as possible
1. You want to display ALL intervals within a given range (not just those with associated data)

Storing structured data like this is usually done with a database. A relational database management system or [RDBMS](https://en.wikipedia.org/wiki/Relational_data_stream_management_system) uses [SQL](https://en.wikipedia.org/wiki/SQL) to manipulate it's data. SQL has some power tools like `DATE`, `DATETIME`, `TIMESTAMP`, and `GROUP BY` that are great for generating time series data.

While there are many RDBMSs out there ([database list](http://db-engines.com/en/ranking)), my explanation will use [PostgreSQL](http://www.postgresql.org) as the database. However I will point out the parts of the solution that are PostgreSQL specific so it may be converted to fit the features of another database.

## The Schema

Let's look at the [schema](https://en.wikipedia.org/wiki/Database_schema) of our database. Let's say we have an online store that sells [widgets](https://en.wiktionary.org/wiki/widget). Every time a widget is sold we save that transaction date in the database as the checkout date of an order. So the database schema might look something like this:




```language-sql
CREATE TABLE widgets(
  id SERIAL,
  name VARCHAR(255),
  price DECIMAL(9, 2)
);

CREATE TABLE order_items(
  id SERIAL,
  quantity INTEGER,
  order_id INTEGER,
  widget_id INTEGER
);

CREATE TABLE orders(
  id SERIAL,
  checkout_date DATETIME
);
```

This schema allows associating any number of widgets with an order through `order_items`. It also allows associating a time of payment for that order in the `orders.checkout_date` field.

The `order_items` table is a [join table](https://en.wikipedia.org/wiki/Junction_table). This is a sort of bridge that efficiently represents a [many-to-many relationship](https://en.wikipedia.org/wiki/Many-to-many_(data_model)) between widgets and orders.

Now that the structure of the data is set let's come up with a scenario and SQL query to test out working with time series data.

## Scenario

> Find the number of orders checked out for all days a sale was made.

## Brainstorming the SQL query

This problem should be screaming `COUNT` and `GROUP BY` to you (for more info on what these do, check [COUNT](http://www.w3schools.com/sql/sql_func_count.asp) and [GROUP BY](http://www.w3schools.com/sql/sql_groupby.asp) on [w3schools.com](http://www.w3schools.com). The reason we're counting the number of orders and grouping that count by the date on which the order was paid.

There is an added condition here though. We don't want to count orders that were not checked out. This means using a [WHERE](http://www.w3schools.com/sql/sql_where.asp) statement to check if a checkout date was set. If a checkout date is set, then we know the order was checked out.

It also would probably be good to [ORDER BY](http://www.w3schools.com/sql/sql_orderby.asp) the checkout date in reverse order or `DESC` (descending) order to view the dates from the most recent to the oldest.

If your checkout date is a `TIMESTAMP` or `DATETIME` it would also be good to cast it as a date with `DATE(checkout_date)` and use a column alias with `AS day`.

So the initial version of a query solving this would look like this:




```language-sql
SELECT
  DATE(checkout_date) AS day,
  COUNT(*) AS num_orders
  FROM orders
  WHERE checkout_date IS NOT NULL
  GROUP BY day
  ORDER BY day DESC
;
```

This might produce a result something like this:




```language-shell
    day     | num_orders 
------------+------------
 2015-10-02 |          1
 2015-10-01 |          6
 2015-09-24 |          1
 2015-09-22 |          1
 2015-09-20 |          1
 2015-09-18 |          1
 2015-09-17 |          2
 ...
```

Yay! We're done right?!

Unfortunately no, this does not satisfy the **desired outcome** from above. It fails to satistfy the specification: **You want to display ALL intervals within a given range (not just those with associated data)**. So why doesn't this work?

## The real problem

We cannot display entries for that which we do not have!

At first glance this might look fine, but then it becomes clear. If there was no sale made, there is no checkout date set. If there is no checkout date set then it will not be counted. If the order is not counted there will be no resulting row in the returned table. This results in gaps in the time series data and is not ideal for the following reasons:

1. It doesn't satisfy the desired outcome
1. It leaves extra work to be done if the gaps are to be filled

## Suggested Solution
### Fill the gaps using a script

It may seem as though the answer here is:

> Why don't I just use a server side scripting language like PHP, Ruby, Python to fill in the gaps?
> Somethind like:

```language-ruby
  results = Order.count_by_day
  j = 0
  time_series_data = []
  365.times do |i|
    day = i.days.ago
    result = results[j]
    if result.day.to_date == day.to_date
      time_series_data << [result.day, result.num_orders]
    else
      time_series_data << [day, 0]
    end
  end
```

This would create an array of all the data returned by the query for the last year. For every day in that time span that there was an entry present in the returned table, the result day and number of orders would be appended to the array. If the day was not present in the returned table, the day would still be appended to the time series data, however with a zero for the number of orders. This would satisfy filling those unwanted gaps.

### Gaps filled with an awesome script! Done?
### No! You wouldn't like what happens!

This should feel wrong. Why?

1. It treats the symptoms and not the problem
1. It is highly inefficient for large data sets

### Unnecessary Subsequent Iterations

By querying the database in the first place you are already performing an operation on the data you want to retrieve. It is ideal to perform any further operations at that time and not after. It would result in looping through the same data twice when once should be enough.

### A Word on SQL Speed

Now is also an great time to point out the concept of speed and the purpose of SQL versus [server side scripting languages](https://en.wikipedia.org/wiki/Server-side_scripting).

SQL is made to perform complex operations on large data sets. It has been optimized to handle exactly this task and it does it extremely well. Server side scripting languages are designed to process and respond to requests. This is not to say that a programming language like [Python](https://www.python.org), [Ruby](https://www.ruby-lang.org/en/), or [PHP](https://secure.php.net) cannot crunch data! However, when searching through massive numbers of items (1,000s or 1,000s of 1,000s) a database will produce a result MUCH faster than a scripting language could search through the same amount of data.

Looking at the suggested solution above in Ruby, it should be clear that even iterating though 365 days (1 year) is cumbersome to do outside SQL. What if you wanted to display all the days between now and 10 years ago? That would take forever with a script like the one above!

## Solution
### Generate All Dates Via SQL

If we can't query what we don't have, then we just need to find a way to have our dates and query them too! This is where a decision needs to be made.

### How to we generate the dates?

Options for generating chronological dates:

1. Create the dates on the fly from scratch everytime they are needed
1. Store dates in their own table and add to them as needed

For the purposes of flexibility and minimizing the number of tables in the database, I chose **Create the dates on the fly from scratch everytime they are needed**. This also later allows for the dynamic specification of a start and end date for the date series.

PostgreSQL has a function [GENERATE_SERIES](http://www.postgresql.org/docs/9.4/static/functions-srf.html) that allows for the creation of a series of time data types separated by a time interval. This is perfect for our situation!

Note that if you're using a different database like MySQL, `GENERATE_SERIES` is not an option. You'll have to find a different way of generating the date table.

## Let's generate a series of days!

So the [docs](http://www.postgresql.org/docs/9.4/static/functions-srf.html) say the expected parameters are passed like this: `generate_series(start, stop, step interval)`. So we want a series of days starting at the first checkout date to now. This is represented by the query below:




```language-sql
SELECT DATE(days) AS day
  FROM GENERATE_SERIES((
    SELECT DATE(MIN(checkout_date)) FROM orders)
  , CURRENT_DATE, '1 DAY'::INTERVAL) days
  ORDER BY days DESC
;
```

**Note:** there is a subquery within the `GENERATE_SERIES` function call to `SELECT` the minimum checkout date from the `orders` table.

This will return a table something like this:




```language-shell
    day     
------------
 2015-10-06
 2015-10-05
 2015-10-04
 2015-10-03
 2015-10-02
 2015-10-01
 2015-09-30
 2015-09-29
 2015-09-28
 2015-09-27
 2015-09-26
 2015-09-25
 2015-09-24
 ...
```

The key difference between these dates and the ones from our earlier query is that ALL the dates in chronological order are present!

### Awesome! We have all the dates, now what?
### Let's talk about [JOIN](http://www.w3schools.com/sql/sql_join.asp)s

A join is when you combine two tables on a column from each table where the values are the same. This is commonly done with [IDs](http://www.w3schools.com/sql/sql_autoincrement.asp) to create [associations](http://stackoverflow.com/a/3934585/5113832) between tables.

The default type of join is an [INNER JOIN](http://www.w3schools.com/sql/sql_join_inner.asp) which will join rows of both tables on any matching values in the specified column. So for instance, if there is a count for the orders on March 2nd, 2015 then that count will be joined on the same date in the generated series table.

### Join me up! I'm in! We're done now right?
### Nope.

The problem with `INNER JOIN` or just `JOIN` is it does not join columns from our generated series where there is no match in the orders table. This is because `JOIN` only combined rows where both tables have a value. `JOIN` excludes the entire row (both tables) if either is `NULL`.

This repeats the problem we experience earlier where days without a count were excluded! However, there is a way around this. Instead we can use [LEFT JOIN](http://www.w3schools.com/sql/sql_join_left.asp) which will preserve the values of the table we are joining onto regardless of whether the "right" table value is `NULL` or present. In this case it means listing days with no order count.

Here is a query that will generate the order count grouped by day starting from the date of the first checked out order to the current date. Notice that the `checkout_date` is casted as a date and there is a sub query to select the minimum checkout date:




```language-sql
SELECT
  DATE(days) AS day,
  COUNT(orders.*) AS num_orders
  FROM GENERATE_SERIES((
    SELECT DATE(MIN(checkout_date)) FROM orders
  ), CURRENT_DATE, '1 DAY'::INTERVAL) days
  LEFT JOIN orders ON DATE(orders.checkout_date) = days
  GROUP BY days
  ORDER BY days DESC
;
```

This will output something like:




```language-shell
    day     | num_orders 
------------+------------
 2015-10-06 |          0
 2015-10-05 |          0
 2015-10-04 |          0
 2015-10-03 |          0
 2015-10-02 |          1
 2015-10-01 |          6
 2015-09-30 |          0
 2015-09-29 |          0
 2015-09-28 |          0
 2015-09-27 |          0
 2015-09-26 |          0
 2015-09-25 |          0
 2015-09-24 |          1
 2015-09-23 |          0
 2015-09-22 |          1
 2015-09-21 |          0
 2015-09-20 |          1
 ...
```

### Success! Finally! No more right?
### Well... not quite yet.

What about weeks, months, and years? And ensuring a value is set on null rows?

Here we have a few SQL functions that are partially PostgreSQL specific and not. Let's take on the more difficult part first!

### Different time intervals

PostgresSQL makes this easy with [DATE_TRUNC](http://www.postgresql.org/docs/9.1/static/functions-datetime.html). Pass a `DATE`, `DATETIME`, or `TIMESTAMP` to `DATE_TRUNC` and you can truncate it to any unit (minute, hour, day, week, month, year). This allows us to specify an interval for the date series table and alter the date we are joining on in the orders table.

`DATE_TRUNC` is PostgreSQL specific, other databases will require another solution.

So our query for the count of all orders grouped by week would look like this:




```language-sql
SELECT
  DATE(weeks) AS week,
  COUNT(orders.*)
  FROM GENERATE_SERIES((
    SELECT DATE(DATE_TRUNC('WEEK', MIN(checkout_date))) FROM orders)
  , CURRENT_DATE, '1 WEEK'::INTERVAL) weeks
  LEFT JOIN orders ON DATE(DATE_TRUNC('WEEK', orders.checkout_date)) = weeks
  GROUP BY weeks
  ORDER BY weeks DESC
;
```

This will produce:




```language-shell
    week    | count 
------------+-------
 2015-10-05 |     0
 2015-09-28 |     7
 2015-09-21 |     2
 2015-09-14 |     7
 2015-09-07 |     5
 2015-08-31 |     8
 2015-08-24 |     4
 2015-08-17 |     4
 2015-08-10 |     8
 2015-08-03 |     4
 2015-07-27 |     1
 2015-07-20 |     6
 ...
```

Now we have the same organization of data and we grouped the count by week instead of day! This same method can be used for any time unit. The key is to use a database function to truncate the date to the start day of the week, month, or year. Once this is done the series table and the `orders` table can be joined on the truncated date.

### Ensuring default values with [COALESCE](http://www.postgresql.org/docs/9.4/static/functions-conditional.html)

In my test cases and the case of `COUNT` here, we haven't come across the issue of an empty value in our returned `num_orders` column. However, it shouldn't be assumed this will always have a value. In fact, it most likely will be `NULL` because we are joining regardless of if it has a value or not using `LEFT JOIN`!

To ensure a value is set we can use `COALESCE` to provided a default value if the value is `NULL`. `COALESCE` is not PostgreSQL specific and is widely supported by the most common RDBMSs.

Here is a query that assumes we are joining our `widgets` and `order_items` tables along with `orders` to get the sum of the revenue for each week since the week of the first checkout date:




```language-sql
SELECT
  DATE(weeks) AS week,
  COALESCE(SUM(order_items.quantity * widgets.price), 0) AS amount
  FROM GENERATE_SERIES((
    SELECT DATE(DATE_TRUNC('WEEK', MIN(checkout_date))) FROM orders)
  , CURRENT_DATE, '1 WEEK'::INTERVAL) weeks
  LEFT JOIN orders ON DATE(DATE_TRUNC('WEEK', orders.checkout_date)) = weeks
  LEFT JOIN order_items ON orders.id = order_items.order_id
  LEFT JOIN widgets ON widgets.id = order_items.widget_id
  GROUP BY weeks
  ORDER BY weeks DESC
;
```

The result would resemble this:




```language-shell
    week    |  amount  
------------+----------
 2015-10-05 |        0
 2015-09-28 |  5735.21
 2015-09-21 |  4099.18
 2015-09-14 | 11805.84
 2015-09-07 |  8610.55
 2015-08-31 |  8229.83
 2015-08-24 |  3975.25
 2015-08-17 |  7235.50
 2015-08-10 | 10105.83
 2015-08-03 |  5276.95
 2015-07-27 |   880.87
 2015-07-20 | 11147.87
 2015-07-13 |        0
 ...
```

Note that where there are zeros where the value would otherwise be `NULL` without the use of `COALESCE`.

## Conclusion

At this point we have satisfied the desired outcome:

### Desired outcome

1. The data is organized according to a time interval
1. The data is processed efficiently
1. The operation to process the data is as fast as possible
1. ALL intervals within a given range are displayed (not just those with associated data)

### Dynamic queries with Server Side Scripting

With the solution queries written out in raw SQL it is now possible to implement various time series queries in any framework or scripting language that can communicate with a database. For the project in question I implemented these queries in [Ruby on Rails](http://rubyonrails.org).

Once implemented within a dynamic programming language, you can specify any date range or time interval to suit your needs.

Hopefully this article helped shed some light on and give you ideas for working with time series data.




