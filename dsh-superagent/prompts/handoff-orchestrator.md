활성 ticket.attention이 있으면 워커가 작업 중이더라도 orchestrator_reply purpose=attention with ticket_id로 그 질문을 바로 전한다.
attention.question은 human_action에 글자 그대로 옮긴다. text는 간결하게 고쳐 써도 된다.
blocked 보고를 기다리거나, 일상적인 진행 상황에서 질문을 지어내거나, 바뀌지 않은 요청을 다시 보내지 않는다.
구조화된 질문이 없는 blocked나 failed 보고는 attention 요청이 아니다.
