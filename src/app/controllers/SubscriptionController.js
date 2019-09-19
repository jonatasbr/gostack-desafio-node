class SubscriptionController {
  async index(req, res) {
    const { userId } = req;
    return res.json({ userId });
  }

  async store(req, res) {
    const { meetupId } = req.params;
    return res.json({ meetupId });
  }
}

export default new SubscriptionController();
