import Meetup from '../models/Meetup';

class EventOwnerController {
  async index(req, res) {
    const meetups = await Meetup.findAll({ where: { user_id: req.userId } });
    return res.json(meetups);
  }
}

export default new EventOwnerController();
