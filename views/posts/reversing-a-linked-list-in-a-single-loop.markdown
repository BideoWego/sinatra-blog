

Recently I wanted to refactor some code of mine that reverses an linked list
where each node only has a reference to it's next node.

My original code did this in 2 loops. It first added each node to an array,
then reverse traversed the array and altered the nodes in reverse order.

I since then decided to refactor my code to do this in only 1 loop.
While both would technically be called O(n) time or linear time.
It is clear that 1 loop is better than 2 and more efficient in all possible ways.

I found a very elegant solution on this stack overflow post [here](http://stackoverflow.com/questions/22605050/reverse-singly-linked-list-java/22605190#22605190) and hacked it to suit my needs.

Here is the code:
(Note this is not the full class as it is missing
add, remove, and insert methods)





```language-ruby
class LinkedList
  def initialize
    @length = 0
    @head = nil
    @tail = nil
    @nodes = []
  end

  def reverse
    @tail = current = @head
    last = nil
    while current
      nxt = current.next
      current.next = last
      last = current
      current = nxt
    end
    @head = last

    @length
  end
end
```




This is of course in Ruby and only for purposes of illustration for
how data structures are implemented. In practice, a low level
linked list would be implemented in C for speed and efficiency.

Here is a text based illustration of what is happening using this code
when calling `reverse` on a linked list with 3 nodes.




```language-ruby
# Reverse a Linked List in 1 while loop - O(n)
# 
# - 0 -
# Assume we have a linked list with 3 nodes
# each with a next value that points to the
# node to the right
# - - - - - - - - - - - - - - - - - - - - - - - -
[{next: 1},   {next: 2},  {next: nil}]


# - 1 -
# Start out setting @head, current, and @tail
# to the head of the linked list
# Create a variable last that is nil
# - - - - - - - - - - - - - - - - - - - - - - - -

[{next: 1},   {next: 2},  {next: nil}]

@head         
current         
@tail


# - 2 -
# (Begin while current is not nil loop)
# 
# Set a variable nxt to current.next (second node)
# Set current.next to last (nil)
# Set last to current (first node)
# Set current to nxt (second node)
# - - - - - - - - - - - - - - - - - - - - - - - -
[{next: nil},   {next: 2},  {next: nil}]

                nxt
last
                current
@head
@tail


# - 3 -
# Current is not nil so the while loop repeats
# Set nxt to current.next (third node)
# Set current.next to last (first node)
# Set last to current (second node)
# Set current to nxt (third node)
# - - - - - - - - - - - - - - - - - - - - - - - -
[{next: nil},   {next: 0},  {next: nil}]

                            nxt
                last
                            current
@head
@tail


# - 4 -
# Current node is still not nil so the while loop continues
# Set nxt to current.next (nil)
# Set current.next = last (second node)
# Set last to current (third node)
# Set current to nxt (nil)
# - - - - - - - - - - - - - - - - - - - - - - - -
[{next: nil},   {next: 0},  {next: 1}]

                            last
@head
@tail


# - 5 -
# Now the nodes are reversed and all that is left to do
# is point the @head reference to last
# - - - - - - - - - - - - - - - - - - - - - - - -
[{next: nil},   {next: 0},  {next: 1}]

                            last
                            @head
@tail
```




Iterating through the linked list this way effectively creates variables at
each node that allow access to both the current node's previous node
and next (already available by default definition of a linked list node).

## Conclusion

It is always important to optimize your code to be more efficient and
remove iterations when they are not necessary. Although this is fairly complex
it is worth doing because assuming the linked list is low level functionality for
implementing a hash table or another data structure, you'd want it to perform this
type of functionality as quickly as possible.







