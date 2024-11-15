import { Helmet } from "react-helmet";
import AppBanner from "../../appBanner/AppBanner";
import Quiz from "../../quiz/quiz";

const QuizPage = () => {
    return (
        <>
            <Helmet>
                <meta
                    name="description"
                    content="Page with list of our comics"
                />
                <title>Quiz page</title>
            </Helmet>
            <Quiz />
        </>
    )
}

export default QuizPage;