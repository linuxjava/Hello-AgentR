package com.xgc.agent.rag.knowledge;

import com.xgc.agent.framework.base.error.exception.WebAdminException;
import com.xgc.agent.rag.knowledge.error.KnowledgeErrorCode;
import com.xgc.agent.rag.knowledge.util.KnowledgeFieldRules;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * 字段规则单测（无需 Spring）。
 */
class KnowledgeFieldRulesTest {

    @Test
    void normalizeName_trimsAndAcceptsChinese() {
        assertThat(KnowledgeFieldRules.normalizeName("  员工手册  ")).isEqualTo("员工手册");
    }

    @Test
    void normalizeName_rejectsBlankOrTooLong() {
        assertThatThrownBy(() -> KnowledgeFieldRules.normalizeName("   "))
                .isInstanceOf(WebAdminException.class)
                .extracting(ex -> ((WebAdminException) ex).getErrorCode())
                .isEqualTo(KnowledgeErrorCode.NAME_INVALID.code());
        assertThatThrownBy(() -> KnowledgeFieldRules.normalizeName("a".repeat(65)))
                .isInstanceOf(WebAdminException.class);
    }

    @Test
    void normalizeNamespace_acceptsLowerAlnum() {
        assertThat(KnowledgeFieldRules.normalizeNamespace(" hrfaq ")).isEqualTo("hrfaq");
    }

    @Test
    void normalizeNamespace_rejectsHyphenAndUppercase() {
        assertThatThrownBy(() -> KnowledgeFieldRules.normalizeNamespace("hr-faq"))
                .isInstanceOf(WebAdminException.class);
        assertThatThrownBy(() -> KnowledgeFieldRules.normalizeNamespace("HrFaq"))
                .isInstanceOf(WebAdminException.class);
    }

    @Test
    void normalizeDescription_blankBecomesNullAndRejectsOversize() {
        assertThat(KnowledgeFieldRules.normalizeDescription("  ")).isNull();
        assertThat(KnowledgeFieldRules.normalizeDescription("简介")).isEqualTo("简介");
        assertThatThrownBy(() -> KnowledgeFieldRules.normalizeDescription("x".repeat(201)))
                .isInstanceOf(WebAdminException.class);
    }
}
