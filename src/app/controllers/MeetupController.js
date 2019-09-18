// import Meetup from '../models/Meetup';

class MeetupController {
  async store(req, res) {
    return res.json(req.body);
  }
}

export default new MeetupController();
