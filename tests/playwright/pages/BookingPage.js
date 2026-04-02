const { BasePage } = require('./BasePage');

class BookingPage extends BasePage {
  constructor(page) {
    super(page);
    this.bikeId = page.getByTestId('book-bike-id');
    this.pickup = page.getByTestId('book-pickup');
    this.dropoff = page.getByTestId('book-dropoff');
    this.submit = page.getByTestId('book-submit');
  }

  async open(bikeId) {
    await this.goto(bikeId ? `/booking.html?bike_id=${bikeId}` : '/booking.html');
  }

  async fillBooking(bikeId, pickupLocal, dropoffLocal) {
    await this.bikeId.fill(String(bikeId));
    await this.pickup.fill(pickupLocal);
    await this.dropoff.fill(dropoffLocal);
  }
}

module.exports = { BookingPage };
