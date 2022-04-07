import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
  // * create an instance of a ticket
  const ticket = Ticket.build({ price: 10, title: 'Ticket #1', userId: '123' });

  // * save the ticket to the database
  await ticket.save();

  // * fetch the ticket twice
  const ticketOne = await Ticket.findById(ticket.id);
  const ticketTwo = await Ticket.findById(ticket.id);

  // * make 2 separate changes to the tickets we fetched
  ticketOne?.set({ price: 20 });
  ticketTwo?.set({ price: 30 });

  // * save the first fetch ticket
  await ticketOne?.save();

  // * save the second fetched ticket and expect an error
  expect(async () => await ticketTwo?.save()).rejects.toThrow();
});

it('increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({ price: 10, title: 'Ticket #1', userId: 'aaa' });
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
